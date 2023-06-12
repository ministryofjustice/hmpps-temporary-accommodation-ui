import type { TemporaryAccommodationApplication } from '@approved-premises/api'
import paths from '../../../server/paths/apply'
import ApplyPage from './applyPage'

export default class RoomSharingPage extends ApplyPage {
  constructor(application: TemporaryAccommodationApplication) {
    super(
      'Requirements for placement',
      application,
      'requirements-for-placement',
      'room-sharing',
      paths.applications.show({
        id: application.id,
      }),
    )
  }

  completeForm() {
    this.completeYesNoInputWithDetailFromPageBody('roomSharing')
  }
}
