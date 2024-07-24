import type { TemporaryAccommodationApplication } from '@approved-premises/api'
import paths from '../../../../../server/paths/apply'
import ApplyPage from '../../applyPage'

import { personName } from '../../../../../server/utils/personUtils'

export default class FoodAllergiesPage extends ApplyPage {
  constructor(application: TemporaryAccommodationApplication) {
    super(
      `Does ${personName(application.person)} have any food allergies or dietary requirements?`,
      application,
      'food-allergies',
      'food-allergies',
      paths.applications.show({ id: application.id }),
    )
  }

  completeForm() {
    this.completeYesNoInputWithDetailFromPageBody('foodAllergies')
  }
}
