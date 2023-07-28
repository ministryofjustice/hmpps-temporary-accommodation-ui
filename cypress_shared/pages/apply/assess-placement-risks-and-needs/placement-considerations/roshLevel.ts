import type { TemporaryAccommodationApplication } from '@approved-premises/api'
import paths from '../../../../../server/paths/apply'
import ApplyPage from '../../applyPage'

export default class RoshLevelPage extends ApplyPage {
  constructor(application: TemporaryAccommodationApplication) {
    super(
      'Placement considerations',
      application,
      'placement-considerations',
      'rosh-level',
      paths.applications.pages.show({
        id: application.id,
        task: 'placement-considerations',
        page: 'substance-misuse',
      }),
    )
  }

  completeForm() {
    this.completeTextInputFromPageBody('riskToChildren')
    this.completeTextInputFromPageBody('riskToPublic')
    this.completeTextInputFromPageBody('riskToKnownAdult')
    this.completeTextInputFromPageBody('riskToStaff')
  }
}
