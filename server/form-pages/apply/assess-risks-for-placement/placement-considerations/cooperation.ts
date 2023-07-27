import { TemporaryAccommodationApplication as Application } from '@approved-premises/api'
import type { PersonRisksUI, TaskListErrors } from '@approved-premises/ui'
import { Page } from '../../../utils/decorators'

import { mapApiPersonRisksForUi } from '../../../../utils/utils'
import TasklistPage from '../../../tasklistPage'

type CooperationBody = {
  support: string
}

@Page({
  name: 'cooperation',
  bodyProperties: ['support'],
})
export default class Cooperation implements TasklistPage {
  title = 'Cooperation'

  questions: {
    support: string
  }

  risks: PersonRisksUI

  constructor(
    readonly body: Partial<CooperationBody>,
    readonly application: Application,
  ) {
    this.questions = {
      support: `Provide details of how you will support ${application.person.name}'s placement considering any risks to the support worker`,
    }

    this.risks = mapApiPersonRisksForUi(application.risks)
  }

  response() {
    return {
      [`How you will support ${this.application.person.name}'s placement?`]: this.body.support,
    }
  }

  previous() {
    return 'accommodation-sharing'
  }

  next() {
    return 'anti-social-behaviour'
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.support) {
      errors.support = `You must specify how you will support ${this.application.person.name}'s placement`
    }

    return errors
  }
}
