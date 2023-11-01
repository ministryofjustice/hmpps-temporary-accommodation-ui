import { TemporaryAccommodationApplication as Application } from '@approved-premises/api'
import { personName } from '../../../../utils/personUtils'
import { Page } from '../../../utils/decorators'
import TasklistPage from '../../../tasklistPage'

type PopPhoneNumberBody = { phone?: string }
@Page({ name: 'pop-phone-number', bodyProperties: ['phone'] })
export default class PopPhoneNumber implements TasklistPage {
  title: string

  htmlDocumentTitle = "What is the person's phone number?"

  constructor(
    readonly body: Partial<PopPhoneNumberBody>,
    readonly application: Application,
  ) {
    this.title = `What is ${personName(application.person)}'s phone number?`
  }

  response() {
    return {
      "What is the person's phone number?": this.body.phone,
    }
  }

  previous() {
    return 'practitioner-pdu'
  }

  next() {
    return ''
  }

  errors() {
    const errors = {}

    return errors
  }
}
