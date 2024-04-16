import type { Request, RequestHandler, Response } from 'express'

import paths from '../../../paths/temporary-accommodation/manage'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput, insertGenericError } from '../../../utils/validation'
import ReportService from '../../../services/reportService'
import extractCallConfig from '../../../utils/restUtils'
import { filterProbationRegions, userHasReporterRole } from '../../../utils/userUtils'
import { DateFormats, dateExists } from '../../../utils/dateUtils'
import { allReportProbationRegions } from '../../../utils/reportUtils'

export default class ReportsController {
  constructor(private readonly reportService: ReportService) {}

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { errors, errorSummary: requestErrorSummary, userInput } = fetchErrorsAndUserInput(req)

      const callConfig = extractCallConfig(req)

      const { probationRegions: allProbationRegions } = await this.reportService.getReferenceData(callConfig)

      return res.render('temporary-accommodation/reports/new', {
        allProbationRegions: userHasReporterRole(res.locals.user)
          ? allReportProbationRegions(allProbationRegions)
          : filterProbationRegions(allProbationRegions, req),
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
        const { probationRegionId, startDate, endDate, reportType } = req.body
        const callConfig = extractCallConfig(req)

        let error: Error
        let startDateIso: string
        let endDateIso: string

        if (!probationRegionId) {
          error = new Error()
          insertGenericError(error, 'probationRegionId', 'empty')
        }

        if (!startDate) {
          error = error || new Error()
          insertGenericError(error, 'startDate', 'empty')
        } else {
          startDateIso = DateFormats.datepickerInputToIsoString(startDate)

          if (!dateExists(startDateIso)) {
            error = error || new Error()
            insertGenericError(error, 'startDate', 'invalid')
          }
        }

        if (!endDate) {
          error = error || new Error()
          insertGenericError(error, 'endDate', 'empty')
        } else {
          endDateIso = DateFormats.datepickerInputToIsoString(endDate)

          if (!dateExists(endDateIso)) {
            error = error || new Error()
            insertGenericError(error, 'endDate', 'invalid')
          }
        }

        if (error) {
          return catchValidationErrorOrPropogate(req, res, error, paths.reports.new({}))
        }

        return this.reportService.pipeReportForProbationRegion(
          callConfig,
          res,
          probationRegionId,
          startDateIso,
          endDateIso,
          reportType,
        )
      } catch (err) {
        return catchValidationErrorOrPropogate(req, res, err, paths.reports.new({}))
      }
    }
  }
}
