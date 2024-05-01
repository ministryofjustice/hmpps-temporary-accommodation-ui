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

export const dutyToReferOutcomes = {
  acceptedPreventionAndReliefDuty: 'Yes, it was accepted on prevention and relief duty',
  acceptedPriorityNeed: 'Yes, it was accepted on a priority need',
  rejectedNoLocalConnection: "Yes, it was rejected as there's no local connection",
  rejectedIntentionallyHomeless: "Yes, it was rejected as they're considered intentionally homeless",
  rejectedOther: 'Yes, it was rejected for another reason',
  pending: 'No, an outcome has not been received yet',
} as const

export type DtrDetailsBody = {
  reference: string
  localAuthorityAreaName?: string
  dutyToReferOutcome: keyof typeof dutyToReferOutcomes
  dutyToReferOutcomeOtherDetails: string
} & ObjectWithDateParts<'date'>

@Page({
  name: 'dtr-details',
  bodyProperties: [
    'reference',
    'localAuthorityAreaName',
    'dutyToReferOutcome',
    'dutyToReferOutcomeOtherDetails',
    ...dateBodyProperties('date'),
  ],
})
export default class DtrDetails implements TasklistPage {
  title = 'Enter details about the Duty to refer (England) or Application for Assistance (Wales)'

  htmlDocumentTitle = this.title

  questions = {
    reference: 'Reference number',
    date: 'Submission date',
    localAuthority: 'What is the local authority?',
    dutyToReferOutcome: 'Have you received an outcome from the local authority?',
    dutyToReferOutcomeOtherDetails: 'Other outcome details',
  }

  constructor(
    private _body: Partial<DtrDetailsBody>,
    readonly application: Application,
    readonly localAuthorities: Array<LocalAuthorityArea>,
  ) {
    this.localAuthorities = localAuthorities
  }

  static async initialize(
    body: DtrDetailsBody,
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
      dutyToReferOutcome: value.dutyToReferOutcome,
      dutyToReferOutcomeOtherDetails: value.dutyToReferOutcomeOtherDetails,
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
      [this.questions.dutyToReferOutcome]: dutyToReferOutcomes[this.body.dutyToReferOutcome],
      ...(this.body.dutyToReferOutcomeOtherDetails && {
        [this.questions.dutyToReferOutcomeOtherDetails]: this.body.dutyToReferOutcomeOtherDetails,
      }),
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
      errors.reference = 'You must specify the reference number'
    }

    if (dateIsBlank(this.body, 'date')) {
      errors.date = 'Enter a submission date'
    } else if (!dateAndTimeInputsAreValidDates(this.body, 'date')) {
      errors.date = 'You must specify a valid submission date'
    } else if (dateIsInFuture(this.body.date)) {
      errors.date = 'The submission date must not be in the future'
    }

    if (!this.body.localAuthorityAreaName) {
      errors.localAuthorityAreaName = 'Enter a home local authority'
    }

    if (!this.body.dutyToReferOutcome) {
      errors.dutyToReferOutcome = 'Select whether you have received an outcome from the local authority'
    }

    if (this.body.dutyToReferOutcome === 'rejectedOther' && !this.body.dutyToReferOutcomeOtherDetails) {
      errors.dutyToReferOutcomeOtherDetails = 'You must add details about the reason'
    }

    return errors
  }

  getLocalAuthorities() {
    return this.localAuthorities
  }

  items() {
    return Object.keys(dutyToReferOutcomes).map(key => {
      return {
        value: key,
        text: dutyToReferOutcomes[key],
        checked: this.body.dutyToReferOutcome === key,
      }
    })
  }
}
