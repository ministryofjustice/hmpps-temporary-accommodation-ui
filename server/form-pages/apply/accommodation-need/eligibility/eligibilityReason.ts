import { ApprovedPremisesApplication as Application } from '@approved-premises/api'
import type { TaskListErrors } from '@approved-premises/ui'
import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'
import { personName } from '../../../../utils/personUtils'

export const eligibilityReasons = {
  homelessFromCustody: 'Moving on as homeless from custody',
  homelessAfterRerelease: 'Moving on as homeless after re-release following recall',
  homelessFromApprovedPremises: 'Moving on as homeless from an Approved Premises',
  homelessFromBailAccommodation: 'Moving on as homeless from Bail Accommodation and Support Service',
} as const

export type EligibilityReasonsT = keyof typeof eligibilityReasons
type EligibilityReasonBody = { reason: EligibilityReasonsT }

@Page({ name: 'eligibility-reason', bodyProperties: ['reason'] })
export default class EligibilityReason implements TasklistPage {
  title: string

  htmlDocumentTitle = 'How is the person eligible for Temporary Accommodation (TA)?'

  constructor(
    readonly body: Partial<EligibilityReasonBody>,
    readonly application: Application,
  ) {
    const name = personName(application.person)
    this.title = `How is ${name} eligible for Temporary Accommodation (TA)?`
  }

  response() {
    return { 'How is this person eligible for Temporary Accommodation (TA)?': eligibilityReasons[this.body.reason] }
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
