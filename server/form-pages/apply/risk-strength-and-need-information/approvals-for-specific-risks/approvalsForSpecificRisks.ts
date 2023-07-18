import { TemporaryAccommodationApplication as Application } from '@approved-premises/api'
import type { PersonRisksUI, TaskListErrors } from '@approved-premises/ui'
import { Page } from '../../../utils/decorators'

import { mapApiPersonRisksForUi } from '../../../../utils/utils'
import TasklistPage from '../../../tasklistPage'
import {
  BodyWithYesOrNoWithDetail,
  personRisksFlagsResponse,
  personRisksMappaResponse,
  personRisksRoshResponse,
  yesOrNoResponseWithDetail,
} from '../../../utils'

export const approvals = {
  yes: 'Yes',
  needsAddress: 'No, approval is required once an address is proposed by the HPT',
  notRequired: 'No, approvals are not required for this referral',
} as const

type ApprovalsForSpecificRisksBody = {
  approvals: keyof typeof approvals
  approvalsDetail: string
}

@Page({ name: 'approvals-for-specific-risks', bodyProperties: ['approvals', 'approvalsDetail', 'risks'] })
export default class ApprovalsForSpecificRisks implements TasklistPage {
  title = 'Approvals for specific risks'

  questions = {
    approvals: 'Have your received approval for this referral?',
  }

  risks: PersonRisksUI

  constructor(
    readonly body: Partial<ApprovalsForSpecificRisksBody>,
    readonly application: Application,
  ) {
    this.risks = mapApiPersonRisksForUi(application.risks)
  }

  response() {
    let approvalResponse: string

    if (this.body.approvals === 'yes') {
      approvalResponse = yesOrNoResponseWithDetail('approvals', this.body as BodyWithYesOrNoWithDetail<'approvals'>)
    } else {
      approvalResponse = approvals[this.body.approvals]
    }

    return {
      [this.questions.approvals]: approvalResponse,
      ...personRisksRoshResponse(this.application.risks),
      ...personRisksMappaResponse(this.application.risks),
      ...personRisksFlagsResponse(this.application.risks),
    }
  }

  previous() {
    return 'dashboard'
  }

  next() {
    return ''
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.approvals) {
      errors.approvals = 'You must specify if you have reveived approval for this application'
    }

    if (this.body.approvals === 'yes' && !this.body.approvalsDetail) {
      errors.approvalsDetail = 'You must provide details of who gave approval and the date it was given'
    }

    return errors
  }

  items() {
    return Object.keys(approvals).map(key => {
      return {
        value: key,
        text: approvals[key],
      }
    })
  }
}
