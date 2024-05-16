import type { TemporaryAccommodationApplication } from '@approved-premises/api'
import paths from '../../../../../server/paths/apply'
import ApplyPage from '../../applyPage'

export default class ReleaseTypePage extends ApplyPage {
  constructor(application: TemporaryAccommodationApplication) {
    super(
      'What is the release type?',
      application,
      'sentence-information',
      'release-type',
      paths.applications.pages.show({ id: application.id, task: 'sentence-information', page: 'sentence-expiry' }),
    )
  }

  completeForm() {
    this.checkCheckboxesFromPageBody('releaseTypes')
    ;(this.tasklistPage.body.releaseTypes as Array<string>).forEach(key => {
      this.completeDateInputsFromPageBody(`${key}StartDate`)
      this.completeDateInputsFromPageBody(`${key}EndDate`)
    })
  }
}
