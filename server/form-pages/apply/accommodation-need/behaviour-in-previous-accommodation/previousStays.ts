import type { TaskListErrors, YesNoOrIDK } from '@approved-premises/ui'
import { Page } from '../../../utils/decorators'

import { TemporaryAccommodationApplication as Application } from '../../../../@types/shared'
import TasklistPage from '../../../tasklistPage'
import { yesNoOrDontKnowResponse } from '../../../utils'

type PreviousStaysBody = { previousStays: YesNoOrIDK }

@Page({ name: 'previous-stays', bodyProperties: ['previousStays'] })
export default class PreviousStays implements TasklistPage {
  title: string

  questions: {
    previousStays: string
  }

  constructor(
    readonly body: Partial<PreviousStaysBody>,
    readonly application: Application,
  ) {
    const { name } = application.person

    this.title = 'Behaviour in previous accommodation'

    this.questions = {
      previousStays: `Has ${name} previously stayed in Community Accommodation Services (CAS)?`,
    }
  }

  response() {
    return {
      [this.questions.previousStays]: yesNoOrDontKnowResponse('previousStays', this.body),
    }
  }

  previous() {
    return 'dashboard'
  }

  next() {
    return this.body.previousStays === 'yes' ? 'previous-stays-details' : ''
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.previousStays) {
      const { name } = this.application.person

      errors.previousStays = `You must specify whether ${name} has previously stayed in Community Accommodation Services (CAS)`
    }

    return errors
  }
}
