import type { TaskListErrors, YesNoOrIDK } from '@approved-premises/ui'
import { Page } from '../../../utils/decorators'

import { TemporaryAccommodationApplication as Application } from '../../../../@types/shared'
import { personName } from '../../../../utils/personUtils'
import TasklistPage from '../../../tasklistPage'
import { yesNoOrDontKnowResponse } from '../../../utils'
import anonymiseFormContent from '../../../utils/anonymiseFormContent'

type PreviousStaysBody = { previousStays: YesNoOrIDK }

@Page({ name: 'previous-stays', bodyProperties: ['previousStays'] })
export default class PreviousStays implements TasklistPage {
  title = 'Behaviour in previous accommodation'

  htmlDocumentTitle = this.title

  questions: {
    previousStays: string
  }

  constructor(
    readonly body: Partial<PreviousStaysBody>,
    readonly application: Application,
  ) {
    const name = personName(application.person)

    this.questions = {
      previousStays: `Has ${name} previously stayed in Community Accommodation Services (CAS)?`,
    }
  }

  response() {
    return {
      [anonymiseFormContent(this.questions.previousStays, this.application.person)]: yesNoOrDontKnowResponse(
        'previousStays',
        this.body,
      ),
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
      const name = personName(this.application.person)

      errors.previousStays = `You must specify whether ${name} has previously stayed in Community Accommodation Services (CAS)`
    }

    return errors
  }
}
