import { TemporaryAccommodationApplication as Application } from '@approved-premises/api'
import type { TaskListErrors, YesOrNoWithDetail } from '@approved-premises/ui'
import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'
import { yesOrNoResponseWithDetail } from '../../../utils'

type FoodAllergiesBody = YesOrNoWithDetail<'foodAllergies'>

@Page({ name: 'food-allergies', bodyProperties: ['foodAllergies', 'foodAllergiesDetail'] })
export default class FoodAllergies implements TasklistPage {
  title = 'Food allergies'

  questions: {
    foodAllergies: string
  }

  constructor(
    readonly body: Partial<FoodAllergiesBody>,
    readonly application: Application,
  ) {
    this.questions = {
      foodAllergies: `Does ${application.person.name} have any food allergies or dietary requirements?`,
    }
  }

  response() {
    return {
      'Does this person have any food allergies or dietary requirements?': yesOrNoResponseWithDetail(
        'foodAllergies',
        this.body,
      ),
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

    if (!this.body.foodAllergies) {
      errors.foodAllergies = `You must specify if ${this.application.person.name} has any food allergies or dietary requirements`
    }

    if (this.body.foodAllergies === 'yes' && !this.body.foodAllergiesDetail) {
      errors.foodAllergiesDetail = 'You must provide details of any food allergies or dietary requirements'
    }

    return errors
  }
}
