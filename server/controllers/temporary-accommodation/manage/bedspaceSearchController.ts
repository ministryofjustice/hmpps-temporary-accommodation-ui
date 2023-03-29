import type { Request, RequestHandler, Response } from 'express'
import {
  TemporaryAccommodationBedSearchParameters as BedSearchParameters,
  BedSearchResults,
} from '../../../@types/shared'
import { ObjectWithDateParts } from '../../../@types/ui'

import paths from '../../../paths/temporary-accommodation/manage'
import BedspaceSearchService from '../../../services/bedspaceSearchService'
import { DateFormats } from '../../../utils/dateUtils'
import { parseNaturalNumber } from '../../../utils/formUtils'
import extractCallConfig from '../../../utils/restUtils'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput, setUserInput } from '../../../utils/validation'

export default class BedspaceSearchController {
  constructor(private readonly searchService: BedspaceSearchService) {}

  index(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)

      const callConfig = extractCallConfig(req)

      const { pdus: allPdus } = await this.searchService.getReferenceData(callConfig)

      const query = Object.keys(req.query).length ? (req.query as Record<string, string>) : undefined
      let results: BedSearchResults

      try {
        if (query) {
          const { startDate } = DateFormats.dateAndTimeInputsToIsoString(
            query as ObjectWithDateParts<'startDate'>,
            'startDate',
          )

          const durationDays = parseNaturalNumber(query.durationDays)

          results = await this.searchService.search(callConfig, {
            ...query,
            startDate,
            durationDays,
          } as BedSearchParameters)
        }

        res.render('temporary-accommodation/bedspace-search/index', {
          allPdus,
          results,
          errors,
          errorSummary,
          ...query,
          ...userInput,
        })
      } catch (err) {
        setUserInput(req, 'get')
        catchValidationErrorOrPropogate(req, res, err, paths.bedspaces.search({}), 'bedspaceSearch')
      }
    }
  }
}
