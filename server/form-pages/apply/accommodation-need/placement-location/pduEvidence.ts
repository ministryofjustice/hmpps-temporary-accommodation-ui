import { TemporaryAccommodationApplication as Application } from '@approved-premises/api'
import type { PageResponse, TaskListErrors, YesOrNo } from '@approved-premises/ui'
import { Page } from '../../../utils/decorators'
import { personName } from '../../../../utils/personUtils'
import TasklistPage from '../../../tasklistPage'

type ConsentRefusedBody = {
  pduEvidence: YesOrNo
}

@Page({ name: 'pdu-evidence', bodyProperties: ['pduEvidence'] })
export default class PduEvidence implements TasklistPage {
  title: string

  htmlDocumentTitle: string

  regionName: string

  pduName: string

  email: string

  constructor(
    private _body: Partial<ConsentRefusedBody>,
    readonly application: Application,
  ) {
    const name = personName(application.person)
    const pduName = application.data?.['placement-location']?.['placement-pdu'].pduName
    const regionName = application.data?.['placement-location']?.['different-region'].regionName
    this.pduName = pduName || ''
    this.regionName = regionName || ''
    this.email = ''
    this.title = `Evidence from ${this.pduName} PDU that they’ll consider a CAS3 bedspace for ${name}`
    this.htmlDocumentTitle = this.title
  }

  set body(value) {
    this._body = value as ConsentRefusedBody
  }

  get body() {
    return this._body
  }

  response(): PageResponse {
    const translatedResponse: PageResponse = {}
    if (this.body?.pduEvidence === 'yes') {
      translatedResponse['Is there evidence in NDelius that the PDU will consider a CAS3 bedspace?'] = 'Yes'
    }

    return translatedResponse
  }

  previous() {
    return 'placement-pdu'
  }

  next() {
    if (this.body?.pduEvidence === 'yes') {
      return ''
    }

    return 'needs-evidence'
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body?.pduEvidence) {
      errors.pduEvidence = 'Select yes if the evidence is in NDelius'
    }

    return errors
  }
}
