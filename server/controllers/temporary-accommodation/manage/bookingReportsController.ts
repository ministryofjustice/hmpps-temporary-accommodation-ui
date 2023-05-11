import type { Request, RequestHandler, Response } from 'express'

import paths from '../../../paths/temporary-accommodation/manage'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput, insertGenericError } from '../../../utils/validation'
import BookingReportService from '../../../services/bookingReportService'
import extractCallConfig from '../../../utils/restUtils'
import filterProbationRegions from '../../../utils/userUtils'
import { getYearsSince, monthsArr } from '../../../utils/dateUtils'

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
        months: monthsArr,
        years: getYearsSince(2023),
        ...userInput,
      })
    }
  }

  create(): RequestHandler {
    return async (req: Request, res: Response) => {
      try {
        const { probationRegionId, month, year } = req.body
        const callConfig = extractCallConfig(req)

        const error = new Error()

        const fields = [
          { name: 'probationRegionId', value: probationRegionId },
          { name: 'month', value: month },
          { name: 'year', value: year },
        ]

        fields.forEach(field => {
          if (!field.value) {
            insertGenericError(error, field.name, 'empty')
          }
        })

        if (!fields.every(field => Boolean(field.value))) {
          throw error
        }

        await this.bookingReportService.pipeBookingsForProbationRegion(callConfig, res, probationRegionId, month, year)
      } catch (err) {
        catchValidationErrorOrPropogate(req, res, err, paths.reports.bookings.new({}))
      }
    }
  }
}
