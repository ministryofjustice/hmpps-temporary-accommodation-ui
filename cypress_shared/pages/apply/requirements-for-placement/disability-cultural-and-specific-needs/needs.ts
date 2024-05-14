import type { TemporaryAccommodationApplication } from '@approved-premises/api'
import paths from '../../../../../server/paths/apply'
import ApplyPage from '../../applyPage'

export default class NeedsPage extends ApplyPage {
  constructor(application: TemporaryAccommodationApplication) {
    super(
      'Health, disability and cultural needs',
      application,
      'disability-cultural-and-specific-needs',
      'needs',
      paths.applications.show({ id: application.id }),
    )
  }

  completeForm() {
    this.checkCheckboxesWithDetailsFromPageBody('needs')
  }
}
