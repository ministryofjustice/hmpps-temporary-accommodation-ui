import {
  TemporaryAccommodationApplication as Application,
  ProbationDeliveryUnit,
  TemporaryAccommodationApplication,
} from '@approved-premises/api'
import type { DataServices, TaskListErrors } from '@approved-premises/ui'
import { SessionData } from 'express-session'
import { Page } from '../../../utils/decorators'
import TasklistPage from '../../../tasklistPage'
import { CallConfig } from '../../../../data/restClient'

export type PractitionerPduBody = ProbationDeliveryUnit

@Page({ name: 'practitioner-pdu', bodyProperties: ['id'] })
export default class PractitionerPdu implements TasklistPage {
  title: string = 'Update probation practitioner PDU'

  htmlDocumentTitle = this.title

  private readonly userPdu: ProbationDeliveryUnit

  constructor(
    private _body: Partial<PractitionerPduBody>,
    readonly application: Application,
    readonly session?: Partial<SessionData>,
    readonly pdus?: Array<ProbationDeliveryUnit>,
  ) {
    this.pdus = pdus || []
    this.userPdu = session?.userDetails?.probationDeliveryUnit
  }

  static async initialize(
    body: PractitionerPduBody,
    application: TemporaryAccommodationApplication,
    callConfig: CallConfig,
    dataServices: DataServices,
    session?: Partial<SessionData>,
  ) {
    const pdus = await dataServices.referenceDataService.getRegionPdus(callConfig)
    return new PractitionerPdu(body, application, session, pdus)
  }

  set body(value) {
    const selectedPdu = value.id !== undefined && value.name === undefined && this.pdus.find(pdu => pdu.id === value.id)

    this._body = {
      id: selectedPdu?.id || this._body.id || this.userPdu?.id,
      name: selectedPdu?.name || this._body.name || this.userPdu?.name,
    }
  }

  get body() {
    return this._body
  }

  response() {
    return {
      PDU: this.body.name,
    }
  }

  previous() {
    return 'probation-practitioner'
  }

  next() {
    return 'probation-practitioner'
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this._body.id) {
      errors.id = 'You must specify a PDU'
    }

    return errors
  }

  getRegionPdus() {
    return [
      {
        value: '',
        text: 'Select an option',
      },
      ...this.pdus.map(pdu => ({
        value: pdu.id,
        text: pdu.name,
        selected: this._body.id === pdu.id || undefined,
      })),
    ]
  }
}
