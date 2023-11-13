import {
  TemporaryAccommodationApplication as Application,
  LocalAuthorityArea,
  TemporaryAccommodationApplication,
} from '@approved-premises/api'
import type { DataServices, ObjectWithDateParts, TaskListErrors } from '@approved-premises/ui'
import { Page } from '../../../utils/decorators'

import { DateFormats, dateAndTimeInputsAreValidDates, dateIsBlank, dateIsInFuture } from '../../../../utils/dateUtils'
import { CallConfig } from '../../../../data/restClient'
import TasklistPage from '../../../tasklistPage'
import { dateBodyProperties } from '../../../utils'

type DtrDetailsBody = {
  reference: string
  localAuthorityAreaName?: string
} & ObjectWithDateParts<'date'>

@Page({ name: 'dtr-details', bodyProperties: ['reference', 'localAuthorityAreaName', ...dateBodyProperties('date')] })
export default class DtrDetails implements TasklistPage {
  title = 'Provide further details'

  htmlDocumentTitle = this.title

  questions = {
    reference: 'DTR / NOP reference number',
    date: 'Date DTR / NOP was submitted',
    localAuthority: 'What is the local authority?',
  }

  constructor(
    private _body: Partial<DtrDetailsBody>,
    readonly application: Application,
    readonly localAuthorities: Array<LocalAuthorityArea>,
  ) {
    this.localAuthorities = localAuthorities
  }

  static async initialize(
    body: Record<string, unknown>,
    application: TemporaryAccommodationApplication,
    callConfig: CallConfig,
    dataServices: DataServices,
  ) {
    let localAuthorities: Array<LocalAuthorityArea> = []

    try {
      localAuthorities = await dataServices.referenceDataService.getLocalAuthorities(callConfig)
    } catch (e) {
      localAuthorities = []
    }

    const page = new DtrDetails(body, application, localAuthorities)

    return page
  }

  public set body(value: Partial<DtrDetailsBody>) {
    this._body = {
      reference: value.reference,
      localAuthorityAreaName: value.localAuthorityAreaName,
      ...DateFormats.dateAndTimeInputsToIsoString(value, 'date'),
    }
  }

  public get body(): Partial<DtrDetailsBody> {
    return this._body
  }

  response() {
    return {
      [this.questions.reference]: this.body.reference,
      [this.questions.date]: DateFormats.isoDateToUIDate(this.body.date),
      [this.questions.localAuthority]: this.body.localAuthorityAreaName
        ? this.body.localAuthorityAreaName
        : 'No local authority selected',
    }
  }

  previous() {
    return 'dtr-submitted'
  }

  next() {
    return 'crs-submitted'
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.reference) {
      errors.reference = 'You must specify the DTR / NOP reference number'
    }

    if (dateIsBlank(this.body, 'date')) {
      errors.date = 'You must specify the date DTR / NOP was submitted'
    } else if (!dateAndTimeInputsAreValidDates(this.body, 'date')) {
      errors.date = 'You must specify a valid date DTR / NOP was submitted'
    } else if (dateIsInFuture(this.body.date)) {
      errors.date = 'The date DTR / NOP was submitted must not be in the future'
    }

    return errors
  }

  getLocalAuthorities() {
    return this.localAuthorities
  }
}
