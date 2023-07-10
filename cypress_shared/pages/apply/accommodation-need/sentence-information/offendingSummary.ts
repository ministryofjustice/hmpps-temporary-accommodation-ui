import type { TemporaryAccommodationApplication } from '@approved-premises/api'

import paths from '../../../../../server/paths/apply'
import ApplyPage from '../../applyPage'

export default class OffendingSummaryPage extends ApplyPage {
  constructor(application: TemporaryAccommodationApplication) {
    super(
      `Provide a brief summary of ${application.person.name}'s offending history`,
      application,
      'sentence-information',
      'offending-summary',
      paths.applications.show({ id: application.id }),
    )
  }

  completeForm() {
    this.completeTextInputFromPageBody('summary')
  }
}
