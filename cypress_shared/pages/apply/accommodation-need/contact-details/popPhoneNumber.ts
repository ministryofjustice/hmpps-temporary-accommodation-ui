import { TemporaryAccommodationApplication as Application } from '@approved-premises/api'
import paths from '../../../../../server/paths/apply'

import ApplyPage from '../../applyPage'
import { personName } from '../../../../../server/utils/personUtils'

export default class PopPhoneNumber extends ApplyPage {
  constructor(application: Application) {
    super(
      `What is ${personName(application.person)}'s phone number?`,
      application,
      'contact-details',
      'pop-phone-number',
      paths.applications.pages.show({ id: application.id, task: 'contact-details', page: 'practitioner-pdu' }),
    )
  }

  completeForm() {
    this.completeTextInputFromPageBody('phone')
  }
}
