import type { TaskListErrors, YesNoOrIDK } from '@approved-premises/ui'
import { Page } from '../../../utils/decorators'

import { TemporaryAccommodationApplication as Application } from '../../../../@types/shared'
import TasklistPage from '../../../tasklistPage'
import { yesNoOrDontKnowResponse } from '../../../utils'

type HistoryPreviouslySubmittedBody = { referralsPreviouslySubmitted: YesNoOrIDK }

@Page({ name: 'referrals-previously-submitted', bodyProperties: ['referralsPreviouslySubmitted'] })
export default class ReferralsPreviouslySubmitted implements TasklistPage {
  title: string

  questions: {
    referralsPreviouslySubmitted: string
  }

  constructor(readonly body: Partial<HistoryPreviouslySubmittedBody>, readonly application: Application) {
    const { name } = application.person

    this.title = 'Behaviour in previous accommodation'

    this.questions = {
      referralsPreviouslySubmitted: `Has ${name} previously stayed in Community Accommodation Services (CAS)?`,
    }
  }

  response() {
    return {
      [this.questions.referralsPreviouslySubmitted]: yesNoOrDontKnowResponse('referralsPreviouslySubmitted', this.body),
    }
  }

  previous() {
    return 'dashboard'
  }

  next() {
    return this.body.referralsPreviouslySubmitted === 'yes' ? 'referral-history-details' : ''
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.referralsPreviouslySubmitted) {
      const { name } = this.application.person

      errors.referralsPreviouslySubmitted =
        `You must specify whether ${name} has previously stayed in Community Accommodation Services (CAS)`
    }

    return errors
  }
}
