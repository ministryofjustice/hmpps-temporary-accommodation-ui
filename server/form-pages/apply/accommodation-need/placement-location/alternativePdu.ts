import { TemporaryAccommodationApplication as Application, ProbationDeliveryUnit } from '@approved-premises/api'
import type { DataServices, PageResponse, TaskListErrors, YesOrNo } from '@approved-premises/ui'
import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'
import { sentenceCase } from '../../../../utils/utils'
import { CallConfig } from '../../../../data/restClient'

export type AlternativePduBody = {
  alternativePdu: YesOrNo
  pduId?: ProbationDeliveryUnit['id']
  pduName?: ProbationDeliveryUnit['name']
}

@Page({ name: 'alternative-pdu', bodyProperties: ['alternativePdu', 'pduId', 'pduName'] })
export default class AlternativePdu implements TasklistPage {
  title = 'Is placement required in a different PDU (Probation Delivery Unit)?'

  htmlDocumentTitle = this.title

  regionName: string

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
    const pdus = await dataServices.referenceDataService.getPdus(callConfig, { regional: true })
    const regionName = callConfig.probationRegion.name
    const instance = new AlternativePdu(body, application, pdus)
    instance.regionName = regionName
    return instance
  }

  set body(value) {
    this._body = {
      alternativePdu: value.alternativePdu,
    }

    if (value.alternativePdu === 'yes') {
      const submittedPdu = value.pduId && !value.pduName && this.pdus?.find(pdu => pdu.id === value.pduId)

      this._body.pduId = submittedPdu?.id || value.pduId
      this._body.pduName = submittedPdu?.name || value.pduName
    }

    this.application.data['placement-location']['different-region'] = {}
    this.application.data['placement-location']['placement-pdu'] = {}

    if (this.application.data['placement-location']['alternative-region']?.alternativeRegion === 'no') {
      const region =
        this.regionName || this.application.data?.['placement-location']?.['alternative-region']?.regionName || ''

      this.application.data['placement-location']['alternative-region'] = {
        alternativeRegion: 'yes',
        regionName: region,
      }
    }
  }

  get body() {
    return this._body
  }

  response() {
    const translatedResponse: PageResponse = {
      'Is placement required in a different PDU?': sentenceCase(this.body.alternativePdu),
    }

    const region =
      this.regionName || this.application.data?.['placement-location']?.['alternative-region']?.regionName || ''
    if (this.body.alternativePdu === 'yes') {
      translatedResponse[`PDU in ${region}`] = this.body.pduName
    }

    return translatedResponse
  }

  previous() {
    return 'alternative-region'
  }

  next() {
    return this.body.alternativePdu === 'yes' ? 'alternative-pdu-reason' : ''
  }

  errors() {
    const errors: TaskListErrors<this> = {}
    if (!this.body.alternativePdu) {
      errors.alternativePdu = 'Select yes if the placement is required in an different PDU'
    } else if (this.body.alternativePdu === 'yes' && !this.body.pduId) {
      errors.pduId = `Enter a PDU in ${this.regionName}`
    }

    return errors
  }

  getAllPdus() {
    return [
      {
        value: '',
        text: 'Select an option',
      },
      ...(this.pdus ?? []).map(pdu => ({
        value: pdu.id,
        text: pdu.name,
        selected: this.body.pduId === pdu.id || undefined,
      })),
    ]
  }
}
