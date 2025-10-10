import type { Request, RequestHandler, Response } from 'express'

import { addDays } from 'date-fns'
import paths from '../../../paths/temporary-accommodation/manage'
import config from '../../../config'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput, insertGenericError } from '../../../utils/validation'
import ReportService from '../../../services/reportService'
import extractCallConfig from '../../../utils/restUtils'
import { filterProbationRegions, userHasReporterRole } from '../../../utils/userUtils'
import { DateFormats, datepickerInputsAreValidDates } from '../../../utils/dateUtils'
import { allReportProbationRegions } from '../../../utils/reportUtils'

export default class ReportsController {
  constructor(private readonly reportService: ReportService) {}

  index(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { errors, errorSummary: requestErrorSummary, userInput } = fetchErrorsAndUserInput(req)

      const callConfig = extractCallConfig(req)

      const { probationRegions: allProbationRegions } = await this.reportService.getReferenceData(callConfig)

      return res.render('temporary-accommodation/reports/index', {
        allProbationRegions: userHasReporterRole(res.locals.user)
          ? allReportProbationRegions(allProbationRegions)
          : filterProbationRegions(allProbationRegions, req),
        errors,
        errorSummary: requestErrorSummary,
        probationRegionId: req.session.probationRegion.id,
        maxStartDate: DateFormats.isoDateToDatepickerInput(DateFormats.dateObjToIsoDate(addDays(new Date(), -1))),
        maxEndDate: DateFormats.isoDateToDatepickerInput(DateFormats.dateObjToIsoDate(new Date())),
        showGapReportButton: config.flags.showGapReportButton,
        ...userInput,
      })
    }
  }

  create(): RequestHandler {
    // eslint-disable-next-line consistent-return
    return async (req: Request, res: Response) => {
      try {
        const { probationRegionId, startDate, endDate, reportType } = req.body
        const callConfig = extractCallConfig(req)

        let error: Error

        if (!probationRegionId) {
          error = new Error()
          insertGenericError(error, 'probationRegionId', 'empty')
        }

        if (!startDate) {
          error = error || new Error()
          insertGenericError(error, 'startDate', 'empty')
        } else if (!datepickerInputsAreValidDates(startDate, 'startDate')) {
          error = error || new Error()
          insertGenericError(error, 'startDate', 'invalid')
        }

        if (!endDate) {
          error = error || new Error()
          insertGenericError(error, 'endDate', 'empty')
        } else if (!datepickerInputsAreValidDates(endDate, 'endDate')) {
          error = error || new Error()
          insertGenericError(error, 'endDate', 'invalid')
        }

        if (error) {
          return catchValidationErrorOrPropogate(req, res, error, paths.reports.index({}))
        }
        const startDateIso = DateFormats.datepickerInputToIsoString(startDate)
        const endDateIso = DateFormats.datepickerInputToIsoString(endDate)

        await this.reportService.pipeReportForProbationRegion(
          callConfig,
          res,
          probationRegionId,
          startDateIso,
          endDateIso,
          reportType,
        )
      } catch (err) {
        return catchValidationErrorOrPropogate(req, res, err, paths.reports.index({}))
      }
    }
  }
}
