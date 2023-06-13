import { TemporaryAccommodationApplication as Application } from '@approved-premises/api'
import paths from '../../../../../server/paths/apply'

import { getProbationPractitionerName } from '../../../../../server/form-pages/utils'
import ApplyPage from '../../applyPage'

export default class PractitionerPdu extends ApplyPage {
  constructor(application: Application) {
    super(
      `What is ${getProbationPractitionerName(application)}'s PDU?`,
      application,
      'contact-details',
      'practitioner-pdu',
      paths.applications.pages.show({ id: application.id, task: 'contact-details', page: 'backup-contact' }),
    )
  }

  completeForm() {
    this.completeTextInputFromPageBody('pdu')
  }
}
