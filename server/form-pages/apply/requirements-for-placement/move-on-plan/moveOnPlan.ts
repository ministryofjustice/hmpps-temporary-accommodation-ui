import { TemporaryAccommodationApplication as Application } from '@approved-premises/api'
import type { TaskListErrors } from '@approved-premises/ui'
import { personName } from '../../../../utils/personUtils'
import TasklistPage from '../../../tasklistPage'
import { Page } from '../../../utils/decorators'

type MoveOnPlanBody = { plan: string }
@Page({ name: 'move-on-plan', bodyProperties: ['plan'] })
export default class MoveOnPlan implements TasklistPage {
  title: string

  constructor(
    readonly body: Partial<MoveOnPlanBody>,
    readonly application: Application,
  ) {
    const name = personName(application.person)

    this.title = `How will you prepare ${name} for move on after placement?`
  }

  response() {
    return {
      'How will you prepare this person for move on after placement?': this.body.plan,
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
