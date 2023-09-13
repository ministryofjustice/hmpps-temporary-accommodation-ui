import { TemporaryAccommodationApplication as Application } from '@approved-premises/api'
import type { TaskListErrors, YesNoOrIDKWithDetail } from '@approved-premises/ui'
import { Page } from '../../../utils/decorators'

import { personName } from '../../../../utils/personUtils'
import TasklistPage from '../../../tasklistPage'
import { yesNoOrDontKnowResponseWithDetail } from '../../../utils'

type FoodAllergiesBody = YesNoOrIDKWithDetail<'foodAllergies'>

@Page({ name: 'food-allergies', bodyProperties: ['foodAllergies', 'foodAllergiesDetail'] })
export default class FoodAllergies implements TasklistPage {
  title = 'Food allergies'

  htmlDocumentTitle = this.title

  questions: {
    foodAllergies: string
  }

  constructor(
    readonly body: Partial<FoodAllergiesBody>,
    readonly application: Application,
  ) {
    this.questions = {
      foodAllergies: `Does ${personName(application.person)} have any food allergies or dietary requirements?`,
    }
  }

  response() {
    return {
      'Does this person have any food allergies or dietary requirements?': yesNoOrDontKnowResponseWithDetail(
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
      errors.foodAllergies = `You must specify if ${personName(
        this.application.person,
      )} has any food allergies or dietary requirements`
    }

    if (this.body.foodAllergies === 'yes' && !this.body.foodAllergiesDetail) {
      errors.foodAllergiesDetail = 'You must provide details of any food allergies or dietary requirements'
    }

    return errors
  }
}
