import { TemporaryAccommodationApplication as Application } from '@approved-premises/api'
import type { PersonRisksUI, TaskListErrors, YesOrNoWithDetail } from '@approved-premises/ui'
import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'
import { yesOrNoResponseWithDetail } from '../../../utils'
import { mapApiPersonRisksForUi } from '../../../../utils/utils'

type AntiSocialBehaviourBody = YesOrNoWithDetail<'concerns'>

@Page({ name: 'anti-social-behaviour', bodyProperties: ['concerns', 'concernsDetail'] })
export default class AntiSocialBehaviour implements TasklistPage {
  title = 'Anti-social behaviour'

  questions = {
    concerns: 'Are there any concerns or risks relating to anti-social behaviour?',
  }

  risks: PersonRisksUI

  constructor(
    readonly body: Partial<AntiSocialBehaviourBody>,
    readonly application: Application,
  ) {
    this.risks = mapApiPersonRisksForUi(application.risks)
  }

  response() {
    return {
      [this.questions.concerns]: yesOrNoResponseWithDetail('concerns', this.body),
    }
  }

  previous() {
    return 'cooperation'
  }

  next() {
    return 'substance-misuse'
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.concerns) {
      errors.concerns = 'You must specify if there any concerns or risks relating to anti-social behaviour'
    }

    if (this.body.concerns === 'yes' && !this.body.concernsDetail) {
      errors.concernsDetail = 'You must provide details of any concerns or risks relating to anti-social behaviour'
    }

    return errors
  }
}
