import type { TemporaryAccommodationApplication } from '@approved-premises/api'
import paths from '../../../../../server/paths/apply'
import ApplyPage from '../../applyPage'

export default class LocalConnectionsPage extends ApplyPage {
  constructor(application: TemporaryAccommodationApplication) {
    super(
      'Safeguarding and support',
      application,
      'safeguarding-and-support',
      'local-connections',
      paths.applications.pages.show({
        id: application.id,
        task: 'safeguarding-and-support',
        page: 'support-in-the-community',
      }),
    )
  }

  completeForm() {
    this.completeTextInputFromPageBody('localConnections')
  }
}
