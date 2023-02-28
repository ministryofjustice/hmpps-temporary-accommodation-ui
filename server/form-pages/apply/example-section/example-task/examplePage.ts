import { ApprovedPremisesApplication as Application } from '@approved-premises/api'
import type { TaskListErrors, YesOrNo } from '@approved-premises/ui'
import { sentenceCase } from '../../../../utils/utils'
import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'

@Page({ name: 'example-page', bodyProperties: ['exampleAnswer'] })
export default class ExamplePage implements TasklistPage {
  title = 'Example page'

  constructor(readonly body: { exampleAnswer?: YesOrNo }, readonly application: Application) {}

  response() {
    return { [this.title]: sentenceCase(this.body.exampleAnswer) }
  }

  previous() {
    return ''
  }

  next() {
    return 'sentence-type'
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.exampleAnswer) {
      errors.exampleAnswer = 'You must answer yes or no'
    }

    return errors
  }
}
