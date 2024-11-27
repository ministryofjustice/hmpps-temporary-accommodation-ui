import type { Request, RequestHandler, Response } from 'express'
import { BedSearchResults } from '../../../@types/shared'
import { BedspaceSearchFormParameters, ObjectWithDateParts } from '../../../@types/ui'

import paths from '../../../paths/temporary-accommodation/manage'
import { AssessmentsService } from '../../../services'
import BedspaceSearchService from '../../../services/bedspaceSearchService'
import { DateFormats } from '../../../utils/dateUtils'
import { parseNumber } from '../../../utils/formUtils'
import { addPlaceContext, preservePlaceContext, updatePlaceContextWithArrivalDate } from '../../../utils/placeUtils'
import extractCallConfig from '../../../utils/restUtils'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput, setUserInput } from '../../../utils/validation'

export const DEFAULT_DURATION_DAYS = 84

type APISearchQuery = Omit<BedspaceSearchFormParameters, 'occupancyAttribute'> & {
  /**
   * The number of days the Bed will need to be free from the start_date until
   */
  durationDays: string
}

export default class BedspaceSearchController {
  constructor(
    private readonly searchService: BedspaceSearchService,
    private readonly assessmentService: AssessmentsService,
  ) {}

  index(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)

      const placeContext = await preservePlaceContext(req, res, this.assessmentService)

      const callConfig = extractCallConfig(req)

      const { pdus: allPdus } = await this.searchService.getReferenceData(callConfig)

      const query =
        (req.query as unknown as BedspaceSearchFormParameters).durationDays !== undefined
          ? (req.query as unknown as BedspaceSearchFormParameters)
          : undefined

      const apiQueryParams: APISearchQuery =  (query !== undefined)?
        {
        startDate: query?.startDate,
        durationDays: query?.durationDays,
        probationDeliveryUnits: query?.probationDeliveryUnits,
        ...Object.fromEntries(Object.entries(query).filter(([key]) => key !== 'occupancyAttribute')),
      } : undefined

      const placeContextArrivalDate = placeContext?.assessment.accommodationRequiredFromDate
      const startDatePrefill = placeContextArrivalDate
        ? DateFormats.isoToDateAndTimeInputs(placeContextArrivalDate, 'startDate')
        : {}

      let results: BedSearchResults['results']
      let startDate: string

      try {
        if (apiQueryParams) {
          startDate = DateFormats.dateAndTimeInputsToIsoString(
            apiQueryParams as ObjectWithDateParts<'startDate'>,
            'startDate',
          ).startDate

          if (query.occupancyAttribute !== 'all') {
            apiQueryParams.attributes = [query.occupancyAttribute, ...(apiQueryParams?.attributes || [])]
          }

          const durationDays = parseNumber(apiQueryParams.durationDays as APISearchQuery['durationDays'])

          results = (
            await this.searchService.search(callConfig, {
              ...apiQueryParams,
              startDate,
              durationDays,
            })
          )?.results

          updatePlaceContextWithArrivalDate(res, placeContext, startDate)
        }

        const template = results
          ? 'temporary-accommodation/bedspace-search/results'
          : 'temporary-accommodation/bedspace-search/index'

        res.render(template, {
          allPdus,
          results,
          startDate,
          errors,
          errorSummary,
          durationDays: req.query.durationDays || DEFAULT_DURATION_DAYS,
          occupancyAttribute: req.query.occupancyAttribute || 'all',
          ...startDatePrefill,
          ...query,
          ...userInput,
        })
      } catch (err) {
        setUserInput(req, 'get')
        catchValidationErrorOrPropogate(
          req,
          res,
          err,
          addPlaceContext(paths.bedspaces.search({}), placeContext),
          'bedspaceSearch',
        )
      }
    }
  }
}
