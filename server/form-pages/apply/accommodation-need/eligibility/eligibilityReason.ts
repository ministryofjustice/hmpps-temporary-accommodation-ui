import { ApprovedPremisesApplication as Application } from '@approved-premises/api'
import type { TaskListErrors } from '@approved-premises/ui'
import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'

export const eligibilityReasons = {
  homelessFromCustody: 'Moving on as homeless from custody',
  homelessFromApprovedPremises: 'Moving on as homeless from an Approved Premises',
  homelessFromBailAccommodation: 'Moving on as homeless from Bail Accommodation and Support Service',
} as const

export type EligibilityReasonsT = keyof typeof eligibilityReasons
type EligibilityReasonBody = { reason: EligibilityReasonsT }

@Page({ name: 'eligibility-reason', bodyProperties: ['reason'] })
export default class EligibilityReason implements TasklistPage {
  title: string

  constructor(readonly body: Partial<EligibilityReasonBody>, readonly application: Application) {
    const { name } = application.person
    this.title = `How is ${name} eligible for Temporary Accommodation (TA)?`
  }

  response() {
    return { [this.title]: eligibilityReasons[this.body.reason] }
  }

  previous() {
    return 'dashboard'
  }

  next() {
    return 'release-date'
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.reason) {
      errors.reason = 'You must choose a reason'
    }

    return errors
  }

  items() {
    return Object.keys(eligibilityReasons).map(key => {
      return {
        value: key,
        text: eligibilityReasons[key],
        checked: this.body.reason === key,
      }
    })
  }
}