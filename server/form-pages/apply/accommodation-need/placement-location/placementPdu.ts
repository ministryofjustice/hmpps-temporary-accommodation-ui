import {
  TemporaryAccommodationApplication as Application,
  ProbationDeliveryUnit,
  ProbationRegion,
} from '@approved-premises/api'
import type { DataServices, PageResponse, TaskListErrors, YesOrNo } from '@approved-premises/ui'
import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'
import { CallConfig } from '../../../../data/restClient'
import { personName } from '../../../../utils/personUtils'

export type PlacementPduBody = {
  regionId: ProbationRegion['id']
  alternativePdu: YesOrNo
  pduId: ProbationDeliveryUnit['id']
  pduName: ProbationDeliveryUnit['name']
}

@Page({ name: 'placement-pdu', bodyProperties: ['regionId', 'alternativePdu', 'pduId', 'pduName'] })
export default class PlacementPdu implements TasklistPage {
  title: string

  htmlDocumentTitle: string

  regionName: string

  constructor(
    private _body: Partial<PlacementPduBody>,
    readonly application: Application,
    readonly pdus?: Array<ProbationDeliveryUnit>,
  ) {
    const name = personName(application.person)
    this.title = `Which PDU (Probation Delivery Unit) should ${name} be referred to?`
    this.htmlDocumentTitle = this.title
    this.regionName = application.data?.['placement-location']?.['different-region'].regionName || ''
  }

  static async initialize(
    body: PlacementPduBody,
    application: Application,
    callConfig: CallConfig,
    dataServices: DataServices,
  ) {
    const regionId = application.data?.['placement-location']?.['different-region'].regionId || ''
    const pdus = await dataServices.referenceDataService.getPdus(callConfig, { regional: true, regionId })

    return new PlacementPdu(body, application, pdus)
  }

  set body(value) {
    const submittedPdu =
      value.pduId !== undefined && value.pduName === undefined && this.pdus?.find(pdu => pdu.id === value.pduId)

    this._body = {
      ...this._body,
      ...value,
      pduId: submittedPdu?.id || value.pduId,
      pduName: submittedPdu?.name || value.pduName,
    }
  }

  get body() {
    return this._body
  }

  response() {
    const translatedResponse: PageResponse = {
      'Which PDU should the person be placed in?': this.body.pduName,
    }

    return translatedResponse
  }

  previous() {
    return 'different-region'
  }

  next() {
    return 'pdu-evidence'
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.pduId) {
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
      ...this.pdus.map(pdu => ({
        value: pdu.id,
        text: pdu.name,
        selected: this.body.pduId === pdu.id || false,
      })),
    ]
  }
}
