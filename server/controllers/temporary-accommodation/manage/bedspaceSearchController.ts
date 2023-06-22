import type { Request, RequestHandler, Response } from 'express'
import { BedSearchResults } from '../../../@types/shared'
import { ObjectWithDateParts } from '../../../@types/ui'

import paths from '../../../paths/temporary-accommodation/manage'
import BedspaceSearchService from '../../../services/bedspaceSearchService'
import { DateFormats } from '../../../utils/dateUtils'
import { parseNaturalNumber } from '../../../utils/formUtils'
import extractCallConfig from '../../../utils/restUtils'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput, setUserInput } from '../../../utils/validation'

type BedspaceSearchQuery = ObjectWithDateParts<'startDate'> & { probationDeliveryUnit: string; durationDays: string }

export default class BedspaceSearchController {
  constructor(private readonly searchService: BedspaceSearchService) {}

  index(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)

      const callConfig = extractCallConfig(req)

      const { pdus: allPdus } = await this.searchService.getReferenceData(callConfig)

      const query = Object.keys(req.query).length ? (req.query as BedspaceSearchQuery) : undefined

      let results: BedSearchResults
      let startDate: string

      try {
        if (query) {
          startDate = DateFormats.dateAndTimeInputsToIsoString(
            query as ObjectWithDateParts<'startDate'>,
            'startDate',
          ).startDate

          const durationDays = parseNaturalNumber(query.durationDays)

          results = await this.searchService.search(callConfig, {
            ...query,
            startDate,
            durationDays,
          })
        }

        res.render('temporary-accommodation/bedspace-search/index', {
          allPdus,
          results,
          startDate,
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
