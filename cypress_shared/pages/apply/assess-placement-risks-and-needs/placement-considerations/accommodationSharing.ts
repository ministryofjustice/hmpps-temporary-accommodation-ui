import type { TemporaryAccommodationApplication } from '@approved-premises/api'
import paths from '../../../../../server/paths/apply'
import ApplyPage from '../../applyPage'

export default class AccommodationSharingPage extends ApplyPage {
  constructor(application: TemporaryAccommodationApplication) {
    super(
      'Placement considerations',
      application,
      'placement-considerations',
      'accommodation-sharing',
      paths.applications.show({
        id: application.id,
      }),
    )
  }

  completeForm() {
    this.checkRadioButtonFromPageBody('accommodationSharing')

    if (this.tasklistPage.body.accommodationSharing === 'yes') {
      this.completeTextInputFromPageBody('accommodationSharingYesDetail')
    }

    if (this.tasklistPage.body.accommodationSharing === 'no') {
      this.completeTextInputFromPageBody('accommodationSharingNoDetail')
    }
  }
}
