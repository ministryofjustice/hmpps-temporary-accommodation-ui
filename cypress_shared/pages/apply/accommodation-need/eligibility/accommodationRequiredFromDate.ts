import type { TemporaryAccommodationApplication } from '@approved-premises/api'
import paths from '../../../../../server/paths/apply'
import ApplyPage from '../../applyPage'

export default class AccommodationRequiredFromDatePage extends ApplyPage {
  constructor(application: TemporaryAccommodationApplication) {
    super(
      `What date is accommodation required from?`,
      application,
      'eligibility',
      'accommodation-required-from-date',
      paths.applications.pages.show({ id: application.id, task: 'eligibility', page: 'release-date' }),
    )
  }

  completeForm() {
    this.completeDateInputsFromPageBody('accommodationRequiredFromDate')
  }
}
