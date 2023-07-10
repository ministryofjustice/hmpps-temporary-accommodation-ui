/* istanbul ignore file */

import type { Router } from 'express'
import Apply from '../form-pages/apply'

import type { Controllers } from '../controllers'
import paths from '../paths/apply'
import { Services } from '../services'

import actions from './utils'

export default function routes(controllers: Controllers, services: Services, router: Router): Router {
  const { pages } = Apply
  const { get, post, put } = actions(router, services.auditService)
  const { applicationsController, pagesController, peopleController, offencesController, documentsController } =
    controllers

  get(paths.applications.start.pattern, applicationsController.start())
  get(paths.applications.index.pattern, applicationsController.index())
  get(paths.applications.new.pattern, applicationsController.new())
  get(paths.applications.show.pattern, applicationsController.show())
  get(paths.applications.confirm.pattern, applicationsController.confirm())
  post(paths.applications.create.pattern, applicationsController.create())
  post(paths.applications.submission.pattern, applicationsController.submit())

  post(paths.applications.people.find.pattern, peopleController.find())
  get(paths.applications.people.selectOffence.pattern, offencesController.selectOffence())
  get(paths.applications.people.documents.pattern, documentsController.show())

  Object.keys(pages).forEach((taskKey: string) => {
    Object.keys(pages[taskKey]).forEach((pageKey: string) => {
      const { pattern } = paths.applications.show.path(`tasks/${taskKey}/pages/${pageKey}`)
      get(pattern, pagesController.show(taskKey, pageKey))
      put(pattern, pagesController.update(taskKey, pageKey))
    })
  })

  return router
}
