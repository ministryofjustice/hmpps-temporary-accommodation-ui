import type { Request, Response, RequestHandler } from 'express'

import paths from '../../../paths/temporary-accommodation/manage'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../../utils/validation'
import BookingReportService from '../../../services/bookingReportService'
import extractCallConfig from '../../../utils/restUtils'

export default class BookingReportsController {
  constructor(private readonly bookingReportService: BookingReportService) {}

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { errors, errorSummary: requestErrorSummary, userInput } = fetchErrorsAndUserInput(req)

      const callConfig = extractCallConfig(req)

      const { probationRegions: allProbationRegions } = await this.bookingReportService.getReferenceData(callConfig)

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
        const callConfig = extractCallConfig(req)

        if (probationRegionId?.length) {
          await this.bookingReportService.pipeBookingsForProbationRegion(callConfig, res, probationRegionId)
        } else {
          await this.bookingReportService.pipeBookings(callConfig, res)
        }
      } catch (err) {
        catchValidationErrorOrPropogate(req, res, err, paths.reports.bookings.new({}))
      }
    }
  }
}
