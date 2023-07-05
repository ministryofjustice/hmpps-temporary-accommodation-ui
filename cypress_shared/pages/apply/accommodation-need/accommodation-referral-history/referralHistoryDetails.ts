import type { TemporaryAccommodationApplication } from '@approved-premises/api'
import paths from '../../../../../server/paths/apply'
import ApplyPage from '../../applyPage'

export default class PreviousStaysDetailsPage extends ApplyPage {
  constructor(application: TemporaryAccommodationApplication) {
    super(
      `What type of accommodation did ${application.person.name} stay at?`,
      application,
      'behaviour-in-previous-accommodation',
      'previous-stays-details',
      paths.applications.pages.show({
        id: application.id,
        task: 'behaviour-in-previous-accommodation',
        page: 'previous-stays',
      }),
    )
  }

  completeForm() {
    this.checkCheckboxesWithDetailsFromPageBody('accommodationTypes')
  }
}
