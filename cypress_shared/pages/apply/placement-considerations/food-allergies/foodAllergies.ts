import type { TemporaryAccommodationApplication } from '@approved-premises/api'
import paths from '../../../../../server/paths/apply'
import ApplyPage from '../../applyPage'

export default class FoodAllergiesPage extends ApplyPage {
  constructor(application: TemporaryAccommodationApplication) {
    super(
      'Food allergies',
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
