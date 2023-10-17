import type { Request, RequestHandler, Response } from 'express'

import paths from '../../../paths/temporary-accommodation/manage'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput, insertGenericError } from '../../../utils/validation'
import ReportService from '../../../services/reportService'
import extractCallConfig from '../../../utils/restUtils'
import { filterProbationRegions, userHasReporterRole } from '../../../utils/userUtils'
import { getYearsSince, monthsArr } from '../../../utils/dateUtils'

export default class ReportsController {
  constructor(private readonly reportService: ReportService) {}

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { errors, errorSummary: requestErrorSummary, userInput } = fetchErrorsAndUserInput(req)

      const callConfig = extractCallConfig(req)

      const { probationRegions: allProbationRegions } = await this.reportService.getReferenceData(callConfig)

      return res.render('temporary-accommodation/reports/new', {
        allProbationRegions: userHasReporterRole(res.locals.user)
          ? allProbationRegions
          : filterProbationRegions(allProbationRegions, req),
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
        const { probationRegionId, month, year, reportType } = req.body
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

        await this.reportService.pipeReportForProbationRegion(
          callConfig,
          res,
          probationRegionId,
          month,
          year,
          reportType,
        )
      } catch (err) {
        catchValidationErrorOrPropogate(req, res, err, paths.reports.new({}))
      }
    }
  }
}
