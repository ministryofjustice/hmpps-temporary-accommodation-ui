import type { TemporaryAccommodationApplication } from '@approved-premises/api'
import paths from '../../../../../server/paths/apply'
import ApplyPage from '../../applyPage'
import { personName } from '../../../../../server/utils/personUtils'

export default class PreviousStaysDetailsPage extends ApplyPage {
  constructor(application: TemporaryAccommodationApplication) {
    super(
      `What type of accommodation did ${personName(application.person)} stay at?`,
      application,
      'behaviour-in-cas',
      'previous-stays-details',
      paths.applications.pages.show({
        id: application.id,
        task: 'behaviour-in-cas',
        page: 'previous-stays',
      }),
    )
  }

  completeForm() {
    this.checkCheckboxesWithDetailsFromPageBody('accommodationTypes')
  }
}
