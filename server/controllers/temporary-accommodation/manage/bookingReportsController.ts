import type { Request, RequestHandler, Response } from 'express'

import paths from '../../../paths/temporary-accommodation/manage'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput, insertGenericError } from '../../../utils/validation'
import BookingReportService from '../../../services/bookingReportService'
import extractCallConfig from '../../../utils/restUtils'
import filterProbationRegions from '../../../utils/userUtils'

export default class BookingReportsController {
  constructor(private readonly bookingReportService: BookingReportService) {}

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { errors, errorSummary: requestErrorSummary, userInput } = fetchErrorsAndUserInput(req)

      const callConfig = extractCallConfig(req)

      const { probationRegions: allProbationRegions } = await this.bookingReportService.getReferenceData(callConfig)

      return res.render('temporary-accommodation/reports/bookings/new', {
        allProbationRegions: filterProbationRegions(allProbationRegions, req),
        errors,
        errorSummary: requestErrorSummary,
        probationRegionId: req.session.probationRegion.id,
        ...userInput,
      })
    }
  }

  create(): RequestHandler {
    return async (req: Request, res: Response) => {
      try {
        const { probationRegionId } = req.body
        const callConfig = extractCallConfig(req)

        if (!probationRegionId) {
          const error = new Error()
          insertGenericError(error, 'probationRegionId', 'empty')
          throw error
        }

        await this.bookingReportService.pipeBookingsForProbationRegion(callConfig, res, probationRegionId)
      } catch (err) {
        catchValidationErrorOrPropogate(req, res, err, paths.reports.bookings.new({}))
      }
    }
  }
}
