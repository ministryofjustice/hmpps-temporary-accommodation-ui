import { TemporaryAccommodationApplication as Application } from '@approved-premises/api'
import type { TaskListErrors } from '@approved-premises/ui'
import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'
import { personName } from '../../../../utils/personUtils'
import anonymiseFormContent from '../../../utils/anonymiseFormContent'

export const eligibilityReasons = {
  homelessFromCustody: 'Released as homeless from prison',
  homelessFromApprovedPremises: 'Moving on as homeless from an Approved Premises (CAS1)',
  homelessFromBailAccommodation: 'Moving on as homeless from CAS2 (formerly Bail Accommodation Support Services)',
} as const

export type EligibilityReasonsT = keyof typeof eligibilityReasons
type EligibilityReasonBody = { reason: EligibilityReasonsT }

@Page({ name: 'eligibility-reason', bodyProperties: ['reason'] })
export default class EligibilityReason implements TasklistPage {
  title: string

  htmlDocumentTitle = 'How is the person eligible for Transitional Accommodation (CAS3)?'

  constructor(
    readonly body: Partial<EligibilityReasonBody>,
    readonly application: Application,
  ) {
    const name = personName(application.person)
    this.title = `How is ${name} eligible for Transitional Accommodation (CAS3)?`
  }

  response() {
    return { [anonymiseFormContent(this.title, this.application.person)]: eligibilityReasons[this.body.reason] }
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
    return Object.entries(eligibilityReasons).map(([key, value]) => {
      return {
        value: key,
        text: value,
        checked: this.body.reason === key,
      }
    })
  }
}
