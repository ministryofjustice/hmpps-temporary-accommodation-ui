import type { TemporaryAccommodationApplication } from '@approved-premises/api'
import paths from '../../../../../server/paths/apply'
import ApplyPage from '../../applyPage'

export default class CooperationPage extends ApplyPage {
  constructor(application: TemporaryAccommodationApplication) {
    super(
      'Placement considerations',
      application,
      'placement-considerations',
      'cooperation',
      paths.applications.pages.show({
        id: application.id,
        task: 'placement-considerations',
        page: 'accommodation-sharing',
      }),
    )
  }

  completeForm() {
    this.completeTextInputFromPageBody('support')
  }
}
