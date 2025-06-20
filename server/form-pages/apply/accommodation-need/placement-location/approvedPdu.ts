import { TemporaryAccommodationApplication as Application } from '@approved-premises/api'
import type { PageResponse, TaskListErrors } from '@approved-premises/ui'
import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'

type ConsentRefusedBody = Record<string, unknown>

@Page({ name: 'approved-pdu', bodyProperties: ['alternativePdu', 'pduId', 'pduName'] })
export default class ApprovedPdu implements TasklistPage {
  title = 'Has the PDU transfer been approved?'

  htmlDocumentTitle = this.title

  // static async initialize(
  //   body: ApprovedPduBody,
  //   application: Application,
  //   callConfig: CallConfig,
  //   dataServices: DataServices,
  // ) {
  //   const pdus = await dataServices.referenceDataService.getPdus(callConfig)
  //   return new ApprovedPdu(body, application, pdus)
  // }

  body: ConsentRefusedBody

  constructor(
    body: Partial<ConsentRefusedBody>,
    private readonly application: Application,
  ) {
    this.body = body as ConsentRefusedBody
  }

  response(): PageResponse {
    const translatedResponse: PageResponse = {}
    if (this.body?.alternativePdu === 'yes') {
      translatedResponse['Has the PDU transfer been approved?'] = 'Yes'
    }

    return translatedResponse
  }

  // response() {
  //   const translatedResponse: PageResponse = {
  //     'Has the PDU transfer been approved?': sentenceCase(this.body.alternativePdu),
  //   }

  //   return translatedResponse
  // }

  previous() {
    return 'dashboard'
  }

  next() {
    console.log('next', this.body)
    if (this.body?.alternativePdu === 'yes') {
      return ''
    }

    return ''
  }

  errors() {
    const errors: TaskListErrors<this> = {}
    console.log('errors', this.body)
    if (this.body?.alternativePdu === 'no') {
      this.body = null as ConsentRefusedBody
    }

    return errors
  }
}
