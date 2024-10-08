import type { Request, RequestHandler, Response } from 'express'
import { BedSearchResults } from '../../../@types/shared'
import { ObjectWithDateParts } from '../../../@types/ui'

import paths from '../../../paths/temporary-accommodation/manage'
import { AssessmentsService } from '../../../services'
import BedspaceSearchService from '../../../services/bedspaceSearchService'
import { DateFormats } from '../../../utils/dateUtils'
import { parseNumber } from '../../../utils/formUtils'
import { addPlaceContext, preservePlaceContext, updatePlaceContextWithArrivalDate } from '../../../utils/placeUtils'
import extractCallConfig from '../../../utils/restUtils'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput, setUserInput } from '../../../utils/validation'

export const DEFAULT_DURATION_DAYS = 84

type BedspaceSearchQuery = ObjectWithDateParts<'startDate'> & {
  probationDeliveryUnits: Array<string>
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
        (req.query as BedspaceSearchQuery).durationDays !== undefined ? (req.query as BedspaceSearchQuery) : undefined

      const placeContextArrivalDate = placeContext?.assessment.accommodationRequiredFromDate
      const startDatePrefill = placeContextArrivalDate
        ? DateFormats.isoToDateAndTimeInputs(placeContextArrivalDate, 'startDate')
        : {}

      let results: BedSearchResults['results']
      let startDate: string

      try {
        if (query) {
          startDate = DateFormats.dateAndTimeInputsToIsoString(
            query as ObjectWithDateParts<'startDate'>,
            'startDate',
          ).startDate

          const durationDays = parseNumber(query.durationDays)

          results = (
            await this.searchService.search(callConfig, {
              ...query,
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
