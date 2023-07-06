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

    if ((this.tasklistPage.body.releaseTypes as Array<string>).includes('licence')) {
      this.completeDateInputsFromPageBody('licenceStartDate')
      this.completeDateInputsFromPageBody('licenceEndDate')
    }

    if ((this.tasklistPage.body.releaseTypes as Array<string>).includes('pss')) {
      this.completeDateInputsFromPageBody('pssStartDate')
      this.completeDateInputsFromPageBody('pssEndDate')
    }
  }
}
