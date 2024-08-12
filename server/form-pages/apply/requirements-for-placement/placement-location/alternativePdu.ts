import { TemporaryAccommodationApplication as Application, ProbationDeliveryUnit } from '@approved-premises/api'
import type { DataServices, TaskListErrors, YesOrNo } from '@approved-premises/ui'
import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'
import { sentenceCase } from '../../../../utils/utils'
import { CallConfig } from '../../../../data/restClient'

export type AlternativePduBody = {
  alternativePdu: YesOrNo
  pduId: ProbationDeliveryUnit['id']
  pduName: ProbationDeliveryUnit['name']
}

@Page({ name: 'alternative-pdu', bodyProperties: ['alternativePdu', 'pduId', 'pduName'] })
export default class AlternativePdu implements TasklistPage {
  title = 'Is placement required in an alternative PDU (probation delivery unit)?'

  htmlDocumentTitle = this.title

  constructor(
    private _body: Partial<AlternativePduBody>,
    readonly application: Application,
    readonly pdus?: Array<ProbationDeliveryUnit>,
  ) {}

  static async initialize(
    body: AlternativePduBody,
    application: Application,
    callConfig: CallConfig,
    dataServices: DataServices,
  ) {
    const pdus = await dataServices.referenceDataService.getPdus(callConfig)
    return new AlternativePdu(body, application, pdus)
  }

  set body(value) {
    this._body = {
      alternativePdu: value.alternativePdu,
    }

    if (value.alternativePdu === 'yes') {
      const submittedPdu =
        value.pduId !== undefined && value.pduName === undefined && this.pdus?.find(pdu => pdu.id === value.pduId)

      this._body.pduId = submittedPdu?.id || value.pduId
      this._body.pduName = submittedPdu?.name || value.pduName
    }
  }

  get body() {
    return this._body
  }

  response() {
    const translatedResponse = {
      'Is placement required in an alternative PDU?': sentenceCase(this.body.alternativePdu),
    }

    if (this.body.alternativePdu === 'yes') {
      translatedResponse['PDU for placement'] = this.body.pduName
    }

    return translatedResponse
  }

  previous() {
    return 'dashboard'
  }

  next() {
    return this.body.alternativePdu === 'yes' ? 'alternative-pdu-reason' : ''
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.alternativePdu) {
      errors.alternativePdu = 'You must specify if placement is required in an alternative PDU'
    } else if (this.body.alternativePdu === 'yes' && !this.body.pduId) {
      errors.pduId = 'You must select a PDU'
    }

    return errors
  }

  getAllPdus() {
    return [
      {
        value: '',
        text: 'Select an option',
      },
      ...this.pdus.map(pdu => ({
        value: pdu.id,
        text: pdu.name,
        selected: this.body.pduId === pdu.id || undefined,
      })),
    ]
  }
}
