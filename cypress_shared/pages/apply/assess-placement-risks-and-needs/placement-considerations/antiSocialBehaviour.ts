import type { TemporaryAccommodationApplication } from '@approved-premises/api'
import paths from '../../../../../server/paths/apply'
import ApplyPage from '../../applyPage'

export default class AntiSocialBehaviourPage extends ApplyPage {
  constructor(application: TemporaryAccommodationApplication) {
    super(
      'Placement considerations',
      application,
      'placement-considerations',
      'anti-social-behaviour',
      paths.applications.pages.show({
        id: application.id,
        task: 'placement-considerations',
        page: 'cooperation',
      }),
    )
  }

  completeForm() {
    this.completeYesNoInputWithDetailFromPageBody('concerns')
  }
}
