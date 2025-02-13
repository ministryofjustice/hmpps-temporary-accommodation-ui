import type { TemporaryAccommodationApplication as Application, PersonAcctAlert } from '@approved-premises/api'
import type { DataServices, PageResponse, UIPersonAcctAlert } from '@approved-premises/ui'
import { CallConfig } from '../../../../data/restClient'
import { DateFormats } from '../../../../utils/dateUtils'
import TasklistPage from '../../../tasklistPage'
import { mapAcctAlertsForPageBody } from '../../../utils'
import { Page } from '../../../utils/decorators'

type AcctAlertsBody = {
  acctAlerts: Array<UIPersonAcctAlert>
}

export const acctAlertResponse = (acctAlert: UIPersonAcctAlert) => {
  // TODO: remove alertId and Comments once api has been rolled out
  return {
    'Alert type': acctAlert.alertTypeDescription || acctAlert.alertId,
    'ACCT description': acctAlert.description || acctAlert.comment,
    'Date created': DateFormats.isoDateToUIDate(acctAlert.dateCreated),
    'Expiry date': acctAlert.dateExpires ? DateFormats.isoDateToUIDate(acctAlert.dateExpires) : '',
  }
}

@Page({
  name: 'acct-alerts',
  bodyProperties: ['acctAlerts'],
})
export default class AcctAlerts implements TasklistPage {
  title = 'ACCT'

  htmlDocumentTitle = this.title

  importDate: string

  constructor(
    readonly body: Partial<AcctAlertsBody>,
    readonly application: Application,
  ) {}

  static async initialize(
    _: Record<string, unknown>,
    application: Application,
    callConfig: CallConfig,
    dataServices: DataServices,
  ) {
    let acctAlerts: PersonAcctAlert[] = []

    try {
      acctAlerts = await dataServices.personService.getAcctAlerts(callConfig, application.person.crn)
    } catch (e) {
      if (e?.data?.status !== 404) {
        throw e
      }
    }

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
      : `No ACCT information available for the person at the time of referral`

    return response
  }

  errors() {
    const errors = {}

    return errors
  }
}
