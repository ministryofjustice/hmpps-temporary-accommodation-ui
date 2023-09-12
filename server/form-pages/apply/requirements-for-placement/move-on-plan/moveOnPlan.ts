import { TemporaryAccommodationApplication as Application } from '@approved-premises/api'
import type { TaskListErrors } from '@approved-premises/ui'
import { personName } from '../../../../utils/personUtils'
import TasklistPage from '../../../tasklistPage'
import { Page } from '../../../utils/decorators'
import anonymiseFormContent from '../../../utils/anonymiseFormContent'

type MoveOnPlanBody = { plan: string }
@Page({ name: 'move-on-plan', bodyProperties: ['plan'] })
export default class MoveOnPlan implements TasklistPage {
  title: string

  htmlDocumentTitle = 'How will you prepare the person for move on after placement?'

  constructor(
    readonly body: Partial<MoveOnPlanBody>,
    readonly application: Application,
  ) {
    const name = personName(application.person)

    this.title = `How will you prepare ${name} for move on after placement?`
  }

  response() {
    return {
      [anonymiseFormContent(this.title, this.application.person)]: this.body.plan,
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

    if (!this.body.plan) {
      errors.plan = 'You must specify a move on plan'
    }

    return errors
  }
}
