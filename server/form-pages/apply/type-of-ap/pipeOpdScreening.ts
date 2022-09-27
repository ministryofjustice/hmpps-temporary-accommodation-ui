import type { YesOrNo } from 'approved-premises'

import TasklistPage from '../../tasklistPage'

export default class PipeOpdReferral implements TasklistPage {
  name = 'pipe-opd-screening'

  title = 'Has a referral for PIPE placement been recommended in the OPD pathway plan?'

  body: { pipeReferral: YesOrNo; pipeReferralMoreDetail: string }

  constructor(body: Record<string, unknown>) {
    this.body = {
      pipeReferral: body.pipeReferral as YesOrNo,
      pipeReferralMoreDetail: body.pipeReferralMoreDetail as string,
    }
  }

  previous() {
    return 'pipe-referral'
  }

  errors() {
    const errors = []

    if (!this.body.pipeReferral) {
      errors.push({
        propertyName: '$.pipeReferral',
        errorType: 'empty',
      })
    }

    return errors
  }
}
