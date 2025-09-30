import type { FullPerson, TemporaryAccommodationApplication } from '@approved-premises/api'
import paths from '../../../../../server/paths/apply'
import ApplyPage from '../../applyPage'

export default class DifferentRegionPage extends ApplyPage {
  constructor(application: TemporaryAccommodationApplication) {
    super(
      `Which region should ${(application.person as FullPerson).name} be placed in?`,
      application,
      'placement-location',
      'different-region',
      paths.applications.show({
        id: application.id,
      }),
    )
  }

  completeForm() {
    this.checkRadioButtonFromPageBody('regionId')
  }
}
