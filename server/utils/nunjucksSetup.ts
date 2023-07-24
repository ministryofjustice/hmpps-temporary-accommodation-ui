/* eslint-disable no-param-reassign */
/* istanbul ignore file */

import * as pathModule from 'path'
import express from 'express'
import nunjucks from 'nunjucks'

import type { ErrorMessages, PersonStatus } from '@approved-premises/ui'
import { DateFormats, dateInputHint } from './dateUtils'
import {
  convertObjectsToCheckboxItems,
  convertObjectsToRadioItems,
  convertObjectsToSelectOptions,
  dateFieldValues,
  parseNaturalNumber,
} from './formUtils'
import { statusTag as personStatusTag } from './personUtils'
import { statusTag as assessmentStatusTag } from './assessmentUtils'
import { initialiseName, mapApiPersonRisksForUi, removeBlankSummaryListItems, sentenceCase } from './utils'

import { dashboardTableRows } from './applicationUtils'
import * as AttachDocumentsUtils from './attachDocumentsUtils'
import * as BedspaceSearchResultUtils from './bedspaceSearchResultUtils'
import * as OasysImportUtils from './oasysImportUtils'
import * as OffenceUtils from './offenceUtils'
import * as TasklistUtils from './taskListUtils'

import bookingSummaryListRows from '../components/bookingInfo'
import * as BookingListing from '../components/bookingListing'
import lostBedSummaryListRows from '../components/lostBedInfo'
import * as LostBedListing from '../components/lostBedListing'
import config from '../config'
import applyPaths from '../paths/apply'
import managePaths from '../paths/temporary-accommodation/manage'
import staticPaths from '../paths/temporary-accommodation/static'
import { checkYourAnswersSections } from './checkYourAnswersUtils'
import { TemporaryAccommodationAssessment } from '../@types/shared'

const production = process.env.NODE_ENV === 'production'

export default function nunjucksSetup(app: express.Express, path: pathModule.PlatformPath): void {
  app.set('view engine', 'njk')

  app.locals.asset_path = '/assets/'
  app.locals.applicationName = 'Temporary Accommodation'

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

  app.use((req, res, next) => {
    res.locals.actingUserProbationRegion = req?.session?.probationRegion
    return next()
  })

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

  njkEnv.addGlobal('paths', {
    ...managePaths,
    ...applyPaths,
    ...staticPaths,
  })

  const markAsSafe = (html: string): string => {
    const safeFilter = njkEnv.getFilter('safe')
    return safeFilter(html)
  }

  njkEnv.addFilter('initialiseName', initialiseName)
  njkEnv.addGlobal('dateFieldValues', dateFieldValues)
  njkEnv.addGlobal('formatDate', DateFormats.isoDateToUIDate)
  njkEnv.addGlobal('formatDateTime', DateFormats.isoDateTimeToUIDateTime)
  njkEnv.addGlobal('parseNaturalNumber', parseNaturalNumber)
  njkEnv.addGlobal('dateInputHint', dateInputHint)

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

  njkEnv.addGlobal(
    'convertObjectsToCheckboxItems',
    function sendConvertObjectsToCheckboxItems(
      items: Array<Record<string, string>>,
      textKey: string,
      valueKey: string,
      fieldName: string,
    ) {
      return convertObjectsToCheckboxItems(items, textKey, valueKey, fieldName, this.ctx)
    },
  )

  njkEnv.addGlobal('personStatusTag', (status: PersonStatus) => markAsSafe(personStatusTag(status)))
  njkEnv.addGlobal('assessmentStatusTag', (status: TemporaryAccommodationAssessment['status']) =>
    markAsSafe(assessmentStatusTag(status)),
  )

  njkEnv.addGlobal('mergeObjects', (obj1: Record<string, unknown>, obj2: Record<string, unknown>) => {
    return { ...obj1, ...obj2 }
  })

  njkEnv.addGlobal('fetchContext', function fetchContext() {
    return this.ctx
  })

  njkEnv.addGlobal('oasysDisabled', config.flags.oasysDisabled)
  njkEnv.addGlobal('applyDisabled', config.flags.applyDisabled)

  njkEnv.addFilter('mapApiPersonRisksForUi', mapApiPersonRisksForUi)

  njkEnv.addFilter('removeBlankSummaryListItems', removeBlankSummaryListItems)
  njkEnv.addFilter('sentenceCase', sentenceCase)

  njkEnv.addGlobal('checkYourAnswersSections', checkYourAnswersSections)
  njkEnv.addGlobal('dashboardTableRows', dashboardTableRows)

  njkEnv.addGlobal('BookingInfo', { summaryListRows: bookingSummaryListRows })
  njkEnv.addGlobal('BookingListing', BookingListing)
  njkEnv.addGlobal('LostBedListing', LostBedListing)

  njkEnv.addGlobal('BedspaceSearchResultUtils', BedspaceSearchResultUtils)
  njkEnv.addGlobal('LostBedInfo', { summaryListRows: lostBedSummaryListRows })
  njkEnv.addGlobal('OffenceUtils', OffenceUtils)
  njkEnv.addGlobal('TasklistUtils', TasklistUtils)
  njkEnv.addGlobal('OasysImportUtils', OasysImportUtils)
  njkEnv.addGlobal('AttachDocumentsUtils', AttachDocumentsUtils)
}
