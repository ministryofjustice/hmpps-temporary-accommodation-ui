import type { TemporaryAccommodationApplication } from '@approved-premises/api'
import paths from '../../../../../server/paths/apply'
import ApplyPage from '../../applyPage'
import { personName } from '../../../../../server/utils/personUtils'

export default class ReleaseDatePage extends ApplyPage {
  constructor(application: TemporaryAccommodationApplication) {
    super(
      `${personName(application.person)}'s release date?`,
      application,
      'eligibility',
      'release-date',
      paths.applications.pages.show({ id: application.id, task: 'eligibility', page: 'eligibility-reason' }),
    )
  }

  completeForm() {
    this.completeDateInputsFromPageBody('releaseDate')
  }
}
