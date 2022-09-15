import type { Request, Response, RequestHandler, NextFunction } from 'express'
import createError from 'http-errors'

import { ApplicationService } from '../../../services'
import type { DataServices } from '../../../services/applicationService'

import {
  catchValidationErrorOrPropogate,
  catchAPIErrorOrPropogate,
  fetchErrorsAndUserInput,
} from '../../../utils/validation'
import paths from '../../../paths/apply'
import { UnknownPageError } from '../../../utils/errors'

export default class PagesController {
  constructor(private readonly applicationService: ApplicationService, private readonly dataServices: DataServices) {}

  show(): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)
        const page = await this.applicationService.getCurrentPage(req, this.dataServices, userInput)

        res.render(`applications/pages/${req.params.task}/${page.name}`, {
          applicationId: req.params.id,
          errors,
          errorSummary,
          task: req.params.task,
          page,
          ...page.body,
        })
      } catch (e) {
        if (e instanceof UnknownPageError) {
          next(createError(404, 'Not found'))
        } else {
          catchAPIErrorOrPropogate(req, res, e)
        }
      }
    }
  }

  update() {
    return async (req: Request, res: Response) => {
      const page = await this.applicationService.getCurrentPage(req, this.dataServices)

      try {
        this.applicationService.save(page, req)
        req.flash('previousPage', page.name)
        res.redirect(paths.applications.pages.show({ id: req.params.id, task: req.params.task, page: page.next() }))
      } catch (err) {
        catchValidationErrorOrPropogate(
          req,
          res,
          err,
          paths.applications.pages.show({ id: req.params.id, task: req.params.task, page: page.name }),
        )
      }
    }
  }
}
