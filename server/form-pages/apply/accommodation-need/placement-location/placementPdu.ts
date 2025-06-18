import {
  TemporaryAccommodationApplication as Application,
  ProbationDeliveryUnit,
  ProbationRegion,
} from '@approved-premises/api'
import type { DataServices, PageResponse, TaskListErrors, YesOrNo } from '@approved-premises/ui'
import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'
import { sentenceCase } from '../../../../utils/utils'
import { CallConfig } from '../../../../data/restClient'

export type PlacementPduBody = {
  regionId: ProbationRegion['id']
  alternativePdu: YesOrNo
  pduId: ProbationDeliveryUnit['id']
  pduName: ProbationDeliveryUnit['name']
}

@Page({ name: 'placement-pdu', bodyProperties: ['regionId', 'alternativePdu', 'pduId', 'pduName'] })
export default class PlacementPdu implements TasklistPage {
  title = 'Which PDU (Probation Delivery Unit) should the person be placed in?'

  htmlDocumentTitle = this.title

  constructor(
    private _body: Partial<PlacementPduBody>,
    readonly application: Application,
    readonly pdus?: Array<ProbationDeliveryUnit>,
  ) {}

  static async initialize(
    body: PlacementPduBody,
    application: Application,
    callConfig: CallConfig,
    dataServices: DataServices,
  ) {
    console.debug('PlacementPdu.initialize called with body:', body.regionId)
    console.debug(
      'PlacementPdu.initialize called with application:',
      application.data?.['placement-location']['different-region'],
    )
    const pdus = await dataServices.referenceDataService.getPdus(callConfig)
    return new PlacementPdu(body, application, pdus)
  }

  set body(value) {
    console.debug('PlacementPdu.set body called with value:', value)
    const submittedPdu =
      value.pduId !== undefined && value.pduName === undefined && this.pdus?.find(pdu => pdu.id === value.pduId)

    this._body.pduId = submittedPdu?.id || value.pduId
    this._body.pduName = submittedPdu?.name || value.pduName
    this._body.regionId = value.regionId
  }

  get body() {
    return this._body
  }

  response() {
    const translatedResponse: PageResponse = {
      'Which PDU (Probation Delivery Unit) should the person be placed in?': sentenceCase(this.body.pduName),
    }

    return translatedResponse
  }

  previous() {
    return 'different-region'
  }

  next() {
    return 'approved-pdu'
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    // if (!this.body.alternativePdu) {
    //   errors.alternativePdu = 'You must specify if placement is required in an alternative PDU'
    // } else if (this.body.alternativePdu === 'yes' && !this.body.pduId) {
    //   errors.pduId = 'You must select a PDU'
    // }

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
