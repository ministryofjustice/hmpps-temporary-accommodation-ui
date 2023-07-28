import type { TemporaryAccommodationApplication } from '@approved-premises/api'
import paths from '../../../../../server/paths/apply'
import ApplyPage from '../../applyPage'

export default class SubstanceMisusePage extends ApplyPage {
  constructor(application: TemporaryAccommodationApplication) {
    super(
      'Placement considerations',
      application,
      'placement-considerations',
      'substance-misuse',
      paths.applications.pages.show({
        id: application.id,
        task: 'placement-considerations',
        page: 'anti-social-behaviour',
      }),
    )
  }

  completeForm() {
    this.completeYesNoInputWithDetailFromPageBody('substanceMisuse')
  }
}
