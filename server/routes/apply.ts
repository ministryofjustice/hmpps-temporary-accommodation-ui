/* istanbul ignore file */

import type { Router } from 'express'
import type { Controllers } from '../controllers'
import Apply from '../form-pages/apply'
import { createUserCheckMiddleware } from '../middleware/userCheckMiddleware'
import paths from '../paths/apply'
import { Services } from '../services'
import { actions, compose } from './utils'
import { userHasReferrerRoleAndIsApplyEnabled } from '../utils/userUtils'

export default function routes(controllers: Controllers, services: Services, router: Router): Router {
  const { pages } = Apply
  const { get, post, put } = compose(
    actions(router, services.auditService),
    createUserCheckMiddleware(userHasReferrerRoleAndIsApplyEnabled),
  )
  const { applicationsController, pagesController, peopleController, offencesController } = controllers.apply

  get(paths.applications.start.pattern, applicationsController.start(), { auditEvent: 'VIEW_APPLICATION_START' })
  get(paths.applications.index.pattern, applicationsController.index(), { auditEvent: 'VIEW_APPLICATIONS_LIST' })
  get(paths.applications.new.pattern, applicationsController.new(), { auditEvent: 'VIEW_APPLICATION_NEW' })
  get(paths.applications.show.pattern, applicationsController.show(), { auditEvent: 'VIEW_APPLICATION' })
  get(paths.applications.full.pattern, applicationsController.full(), { auditEvent: 'VIEW_FULL_APPLICATION' })
  get(paths.applications.confirm.pattern, applicationsController.confirm(), {
    auditEvent: 'VIEW_APPLICATION_CONFIRM',
  })
  post(paths.applications.create.pattern, applicationsController.create(), {
    auditEvent: 'CREATE_APPLICATION',
  })
  post(paths.applications.submission.pattern, applicationsController.submit(), {
    auditEvent: 'SUBMIT_APPLICATION',
    redirectAuditEventSpecs: [
      {
        path: paths.applications.show.pattern,
        auditEvent: 'SUBMIT_APPLICATION_FAILURE',
      },
      {
        path: paths.applications.confirm.pattern,
        auditEvent: 'SUBMIT_APPLICATION_SUCCESS',
      },
    ],
  })

  post(paths.applications.people.find.pattern, peopleController.find(), {
    auditEvent: 'FIND_APPLICATION_PERSON',
    auditBodyParams: ['crn'],
  })
  get(paths.applications.people.selectOffence.pattern, offencesController.selectOffence(), {
    auditEvent: 'VIEW_APPLICATION_SELECT_OFFENCE',
  })

  Object.keys(pages).forEach((taskKey: string) => {
    Object.keys(pages[taskKey]).forEach((pageKey: string) => {
      const { pattern } = paths.applications.show.path(`tasks/${taskKey}/pages/${pageKey}`)
      get(pattern, pagesController.show(taskKey, pageKey), {
        auditEvent: 'VIEW_APPLICATION_PAGE',
        additionalMetadata: { task: taskKey, page: pageKey },
      })
      put(pattern, pagesController.update(taskKey, pageKey), {
        auditEvent: `UPDATE_APPLICATION_PAGE`,
        additionalMetadata: { task: taskKey, page: pageKey },
        redirectAuditEventSpecs: [
          {
            // If we redirect to the same page, the user has hit an error
            path: pattern,
            auditEvent: 'UPDATE_APPLICATION_PAGE_FAILURE',
          },
          {
            // If we redirect to the task list page, the application updated successfully
            path: paths.applications.show.pattern,
            auditEvent: 'UPDATE_APPLICATION_PAGE_SUCCESS',
          },
          {
            // If we redirect to another application page, the application updated successfully
            path: paths.applications.pages.show.pattern,
            auditEvent: 'UPDATE_APPLICATION_PAGE_SUCCESS',
          },
        ],
      })
    })
  })

  return router
}
