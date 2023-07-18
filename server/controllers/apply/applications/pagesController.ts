import type { NextFunction, Request, RequestHandler, Response } from 'express'
import createError from 'http-errors'

import type { DataServices } from '@approved-premises/ui'
import { ApplicationService } from '../../../services'
import { getPage, getSectionAndTask } from '../../../utils/applicationUtils'

import { viewPath } from '../../../form-pages/utils'
import paths from '../../../paths/apply'
import { UnknownPageError } from '../../../utils/errors'
import extractCallConfig from '../../../utils/restUtils'
import {
  catchAPIErrorOrPropogate,
  catchValidationErrorOrPropogate,
  fetchErrorsAndUserInput,
} from '../../../utils/validation'

export default class PagesController {
  constructor(
    private readonly applicationService: ApplicationService,
    private readonly dataServices: DataServices,
  ) {}

  show(taskName: string, pageName: string): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const callConfig = extractCallConfig(req)
        const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)

        const Page = getPage(taskName, pageName)

        const page = await this.applicationService.initializePage(callConfig, Page, req, this.dataServices, userInput)

        const { section, task } = getSectionAndTask(taskName)

        res.render(viewPath(section, task, page, 'applications'), {
          applicationId: req.params.id,
          errors,
          errorSummary,
          section,
          task,
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

  update(taskName: string, pageName: string) {
    return async (req: Request, res: Response) => {
      const callConfig = extractCallConfig(req)
      const Page = getPage(taskName, pageName)
      const page = await this.applicationService.initializePage(callConfig, Page, req, this.dataServices)

      try {
        await this.applicationService.save(callConfig, page, req)
        const next = page.next()
        if (next) {
          res.redirect(paths.applications.pages.show({ id: req.params.id, task: taskName, page: page.next() }))
        } else {
          res.redirect(paths.applications.show({ id: req.params.id }))
        }
      } catch (err) {
        catchValidationErrorOrPropogate(
          req,
          res,
          err,
          paths.applications.pages.show({ id: req.params.id, task: taskName, page: pageName }),
        )
      }
    }
  }
}
