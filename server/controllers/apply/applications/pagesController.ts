import type { Request, Response, RequestHandler, NextFunction } from 'express'
import createError from 'http-errors'

import ApplicationService from '../../../services/applicationService'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../../utils/validation'
import paths from '../../../paths/apply'
import { UnknownPageError } from '../../../utils/errors'

export default class ApplicationFormController {
  constructor(private readonly applicationService: ApplicationService) {}

  show(): RequestHandler {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        const page = this.applicationService.getCurrentPage(req)
        const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)

        res.render(`applications/pages/${req.params.task}/${page.name}`, {
          applicationId: req.params.id,
          errors,
          errorSummary,
          task: req.params.task,
          page,
          ...userInput,
        })
      } catch (e) {
        if (e instanceof UnknownPageError) {
          next(createError(404, 'Not found'))
        } else {
          throw e
        }
      }
    }
  }
}
