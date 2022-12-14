import type { Request, Response, RequestHandler } from 'express'

import paths from '../../../paths/temporary-accommodation/manage'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../../utils/validation'
import BookingReportService from '../../../services/bookingReportService'

export default class BookingReportsController {
  constructor(private readonly bookingReportService: BookingReportService) {}

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { errors, errorSummary: requestErrorSummary, userInput } = fetchErrorsAndUserInput(req)

      const { token } = req.user

      const { probationRegions: allProbationRegions } = await this.bookingReportService.getReferenceData(token)

      return res.render('temporary-accommodation/reports/bookings/new', {
        allProbationRegions,
        errors,
        errorSummary: requestErrorSummary,
        ...userInput,
      })
    }
  }

  create(): RequestHandler {
    return async (req: Request, res: Response) => {
      try {
        const { probationRegionId } = req.body
        const { token } = req.user

        if (probationRegionId?.length) {
          await this.bookingReportService.pipeBookingsForProbationRegion(token, res, probationRegionId)
        } else {
          await this.bookingReportService.pipeBookings(token, res)
        }
      } catch (err) {
        catchValidationErrorOrPropogate(req, res, err, paths.reports.bookings.new({}))
      }
    }
  }
}
