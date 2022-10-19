import type { YesOrNo } from '@approved-premises/ui'
import type { Application } from '@approved-premises/api'

import TasklistPage from '../../tasklistPage'
import { convertToTitleCase } from '../../../utils/utils'

export default class PipeOpdReferral implements TasklistPage {
  name = 'pipe-opd-screening'

  title = 'Has a referral for PIPE placement been recommended in the OPD pathway plan?'

  body: { pipeReferral: YesOrNo; pipeReferralMoreDetail: string }

  constructor(body: Record<string, unknown>, private readonly application: Application) {
    this.body = {
      pipeReferral: body.pipeReferral as YesOrNo,
      pipeReferralMoreDetail: body.pipeReferralMoreDetail as string,
    }
  }

  previous() {
    return 'pipe-referral'
  }

  response() {
    const response = {
      [this.title]: convertToTitleCase(this.body.pipeReferral),
    } as Record<string, string>

    if (this.body.pipeReferral === 'yes') {
      response[`Additional detail about why ${this.application.person.name} needs a PIPE placement.`] =
        this.body.pipeReferralMoreDetail
    }

    return response
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
