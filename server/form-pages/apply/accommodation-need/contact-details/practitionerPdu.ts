import { TemporaryAccommodationApplication as Application } from '@approved-premises/api'
import type { TaskListErrors } from '@approved-premises/ui'
import { getProbationPractitionerName } from '../../../utils'
import { Page } from '../../../utils/decorators'
import TasklistPage from '../../../tasklistPage'

type PractitionerPduBody = { pdu: string }
@Page({ name: 'practitioner-pdu', bodyProperties: ['pdu'] })
export default class PractitionerPdu implements TasklistPage {
  title: string

  htmlDocumentTitle = "What is the person's PDU?"

  constructor(
    readonly body: Partial<PractitionerPduBody>,
    readonly application: Application,
  ) {
    const name = getProbationPractitionerName(application)

    this.title = `What is ${name}'s PDU?`
  }

  response() {
    return {
      PDU: this.body.pdu,
    }
  }

  previous() {
    return 'backup-contact'
  }

  next() {
    return ''
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.pdu) {
      errors.pdu = 'You must specify a PDU'
    }

    return errors
  }
}
