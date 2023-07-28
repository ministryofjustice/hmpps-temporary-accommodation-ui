import type { TemporaryAccommodationApplication } from '@approved-premises/api'
import paths from '../../../../../server/paths/apply'
import ApplyPage from '../../applyPage'

export default class SupportInTheCommunityPage extends ApplyPage {
  constructor(application: TemporaryAccommodationApplication) {
    super(
      'Safeguarding and support',
      application,
      'safeguarding-and-support',
      'support-in-the-community',
      paths.applications.pages.show({
        id: application.id,
        task: 'safeguarding-and-support',
        page: 'safeguarding-and-vulnerability',
      }),
    )
  }

  completeForm() {
    this.completeTextInputFromPageBody('support')
  }
}
