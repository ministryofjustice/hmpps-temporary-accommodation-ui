import type { Request, RequestHandler, Response } from 'express'
import { type BedspaceSearchAttributes, Cas3BedspaceSearchResults } from '../../../@types/shared'
import { BedspaceAccessiblityAttributes, BedspaceOccupancyAttributes, ObjectWithDateParts } from '../../../@types/ui'

import paths from '../../../paths/temporary-accommodation/manage'
import { AssessmentsService } from '../../../services'
import { validateSearchQuery } from '../../../utils/bedspaceSearchUtils'
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

      let results: Cas3BedspaceSearchResults['results']
      let startDate: string

      try {
        if (query) {
          const validationError = validateSearchQuery(query)

          if (validationError) {
            setUserInput(req, 'get')
            return catchValidationErrorOrPropogate(
              req,
              res,
              validationError,
              addPlaceContext(paths.bedspaces.search({}), placeContext),
              'bedspaceSearch',
            )
          }

          startDate = DateFormats.dateAndTimeInputsToIsoString(
            query as ObjectWithDateParts<'startDate'>,
            'startDate',
          ).startDate

          const durationDays = parseNumber(query.durationDays)

          const selectedAttributes = [
            ...(
              [
                req.query.occupancyAttribute && req.query.occupancyAttribute !== 'all'
                  ? req.query.occupancyAttribute
                  : null,
              ] as BedspaceOccupancyAttributes[]
            ).filter(Boolean),
            ...((req.query.attributes as BedspaceAccessiblityAttributes[]) ?? []),
          ]

          results = (
            await this.searchService.search(callConfig, {
              ...query,
              attributes: selectedAttributes as BedspaceSearchAttributes[],
              startDate,
              durationDays,
            })
          )?.results

          updatePlaceContextWithArrivalDate(res, placeContext, startDate)
        }

        const template = results
          ? 'temporary-accommodation/bedspace-search/results'
          : 'temporary-accommodation/bedspace-search/index'

        return res.render(template, {
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
        return catchValidationErrorOrPropogate(
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
