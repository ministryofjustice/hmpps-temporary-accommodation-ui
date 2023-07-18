import type { ApprovedPremisesApplication, PersonAcctAlert } from '@approved-premises/api'
import type { DataServices, PageResponse } from '@approved-premises/ui'
import { CallConfig } from '../../../../data/restClient'
import { DateFormats } from '../../../../utils/dateUtils'
import TasklistPage from '../../../tasklistPage'
import { PageBodyPersonAcctAlert, mapAcctAlertsForPageBody } from '../../../utils'
import { Page } from '../../../utils/decorators'

type AcctAlertsBody = {
  acctAlerts: Array<PageBodyPersonAcctAlert>
}

export const acctAlertResponse = (acctAlert: PersonAcctAlert) => {
  return {
    'Alert type': acctAlert.alertId,
    'ACCT description': acctAlert.comment,
    'Date created': DateFormats.isoDateToUIDate(acctAlert.dateCreated),
    'Expiry date': DateFormats.isoDateToUIDate(acctAlert.dateExpires),
  }
}

@Page({
  name: 'acct-alerts',
  bodyProperties: ['acctAlerts'],
})
export default class AcctAlerts implements TasklistPage {
  title = 'ACCT'

  importDate: string

  constructor(
    readonly body: Partial<AcctAlertsBody>,
    readonly application: ApprovedPremisesApplication,
  ) {}

  static async initialize(
    _: Record<string, unknown>,
    application: ApprovedPremisesApplication,
    callConfig: CallConfig,
    dataServices: DataServices,
  ) {
    const acctAlerts = await dataServices.personService.getAcctAlerts(callConfig, application.person.crn)
    const page = new AcctAlerts({ acctAlerts: mapAcctAlertsForPageBody(acctAlerts) }, application)

    page.importDate = DateFormats.dateObjToIsoDate(new Date())

    return page
  }

  previous() {
    return 'adjudications'
  }

  next() {
    return ''
  }

  response() {
    const response: PageResponse = {}

    response['ACCT Alerts'] = this.body.acctAlerts.length
      ? this.body.acctAlerts.map(acctAlertResponse)
      : `No ACCT information available for ${this.application.person.name} at the time of referral`

    return response
  }

  errors() {
    const errors = {}

    return errors
  }
}
