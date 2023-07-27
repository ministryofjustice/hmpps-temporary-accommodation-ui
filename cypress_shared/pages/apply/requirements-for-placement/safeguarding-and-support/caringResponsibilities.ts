import type { TemporaryAccommodationApplication } from '@approved-premises/api'
import paths from '../../../../../server/paths/apply'
import ApplyPage from '../../applyPage'

export default class CaringResponsibilities extends ApplyPage {
  constructor(application: TemporaryAccommodationApplication) {
    super(
      'Safeguarding and support',
      application,
      'safeguarding-and-support',
      'caring-responsibilities',
      paths.applications.pages.show({
        id: application.id,
        task: 'safeguarding-and-support',
        page: 'local-connections',
      }),
    )
  }

  completeForm() {
    this.completeYesNoInputWithDetailFromPageBody('caringResponsibilities')
  }
}
