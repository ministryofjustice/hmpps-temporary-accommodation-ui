import type { TemporaryAccommodationApplication } from '@approved-premises/api'

import paths from '../../../../../server/paths/apply'
import { personName } from '../../../../../server/utils/personUtils'
import ApplyPage from '../../applyPage'

export default class OffendingSummaryPage extends ApplyPage {
  constructor(application: TemporaryAccommodationApplication) {
    super(
      `Provide a brief summary of ${personName(application.person)}'s index offence(s) and offending history`,
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
