/* eslint-disable no-param-reassign */
/* istanbul ignore file */

import nunjucks from 'nunjucks'
import express from 'express'
import * as pathModule from 'path'

import type { ErrorMessages, PersonStatus, Task } from '@approved-premises/ui'
import type { Application } from '@approved-premises/api'
import { initialiseName, removeBlankSummaryListItems } from './utils'
import { dateFieldValues, convertObjectsToRadioItems, convertObjectsToSelectOptions } from './formUtils'
import { getTaskStatus, taskLink, getCompleteSectionCount, getService } from './applicationUtils'
import { statusTag } from './personUtils'
import bookingActions from './bookingUtils'
import { DateFormats } from './dateUtils'

import apManagePaths from '../paths/manage'
import apApplyPaths from '../paths/apply'
import taManagePaths from '../paths/temporary-accommodation/manage'

const production = process.env.NODE_ENV === 'production'

export default function nunjucksSetup(app: express.Express, path: pathModule.PlatformPath): void {
  app.set('view engine', 'njk')

  app.locals.asset_path = '/assets/'

  app.use((req, _res, next) => {
    const service = getService(req)

    if (service === 'approved-premises') {
      app.locals.applicationName = 'Approved Premises'

      njkEnv.addGlobal('paths', {
        ...apManagePaths,
        ...apApplyPaths,
      })
    } else {
      app.locals.applicationName = 'Temporary Accommodation'

      njkEnv.addGlobal('paths', {
        ...taManagePaths,
      })
    }

    next()
  })

  // Cachebusting version string
  if (production) {
    // Version only changes on reboot
    app.locals.version = Date.now().toString()
  } else {
    // Version changes every request
    app.use((req, res, next) => {
      res.locals.version = Date.now().toString()
      return next()
    })
  }

  const njkEnv = nunjucks.configure(
    [
      path.join(__dirname, '../../server/views'),
      'node_modules/govuk-frontend/',
      'node_modules/govuk-frontend/components/',
      'node_modules/@ministryofjustice/frontend/',
      'node_modules/@ministryofjustice/frontend/moj/components/',
    ],
    {
      autoescape: true,
      express: app,
    },
  )

  const markAsSafe = (html: string): string => {
    const safeFilter = njkEnv.getFilter('safe')
    return safeFilter(html)
  }

  njkEnv.addFilter('initialiseName', initialiseName)
  njkEnv.addGlobal('dateFieldValues', dateFieldValues)
  njkEnv.addGlobal('formatDate', DateFormats.isoDateToUIDate)

  njkEnv.addGlobal('dateFieldValues', function sendContextToDateFieldValues(fieldName: string, errors: ErrorMessages) {
    return dateFieldValues(fieldName, this.ctx, errors)
  })

  njkEnv.addGlobal(
    'convertObjectsToRadioItems',
    function sendContextConvertObjectsToRadioItems(
      items: Array<Record<string, string>>,
      textKey: string,
      valueKey: string,
      fieldName: string,
    ) {
      return convertObjectsToRadioItems(items, textKey, valueKey, fieldName, this.ctx)
    },
  )

  njkEnv.addGlobal(
    'convertObjectsToSelectOptions',
    function sendContextConvertObjectsToSelectOptions(
      items: Array<Record<string, string>>,
      prompt: string,
      textKey: string,
      valueKey: string,
      fieldName: string,
    ) {
      return convertObjectsToSelectOptions(items, prompt, textKey, valueKey, fieldName, this.ctx)
    },
  )

  njkEnv.addGlobal('bookingActions', bookingActions)

  njkEnv.addGlobal('getCompleteSectionCount', getCompleteSectionCount)

  njkEnv.addGlobal('getTaskStatus', (task: Task, application: Application) =>
    markAsSafe(getTaskStatus(task, application)),
  )

  njkEnv.addGlobal('taskLink', (task: Task, applicationId: string) => markAsSafe(taskLink(task, applicationId)))

  njkEnv.addGlobal('statusTag', (status: PersonStatus) => markAsSafe(statusTag(status)))

  njkEnv.addFilter('removeBlankSummaryListItems', removeBlankSummaryListItems)
}
