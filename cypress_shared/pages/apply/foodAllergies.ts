import type { TemporaryAccommodationApplication } from '@approved-premises/api'
import paths from '../../../server/paths/apply'
import ApplyPage from './applyPage'

export default class FoodAllergiesPage extends ApplyPage {
  constructor(application: TemporaryAccommodationApplication) {
    super(
      'Requirements for placement',
      application,
      'requirements-for-placement',
      'food-allergies',
      paths.applications.pages.show({
        id: application.id,
        task: 'requirements-for-placement',
        page: 'room-sharing',
      }),
    )
  }

  completeForm() {
    this.completeYesNoInputWithDetailFromPageBody('foodAllergies')
  }
}
