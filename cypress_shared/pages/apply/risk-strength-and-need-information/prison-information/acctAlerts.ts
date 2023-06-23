import type { PersonAcctAlert, TemporaryAccommodationApplication } from '@approved-premises/api'
import paths from '../../../../../server/paths/apply'
import { DateFormats } from '../../../../../server/utils/dateUtils'
import ApplyPage from '../../applyPage'

export default class AdditionalLicenceConditionsPage extends ApplyPage {
  constructor(application: TemporaryAccommodationApplication) {
    super(
      'Prison information',
      application,
      'prison-information',
      'acct-alerts',
      paths.applications.pages.show({ id: application.id, task: 'prison-information', page: 'adjudications' }),
    )
  }

  shouldDisplayAcctAlerts(acctAlerts: Array<PersonAcctAlert>) {
    acctAlerts.forEach(acctAlert => {
      cy.get('tr')
        .contains(`${acctAlert.alertId}`)
        .parent()
        .within(() => {
          cy.get('td').eq(1).contains(acctAlert.comment)
          cy.get('td').eq(2).contains(DateFormats.isoDateToUIDate(acctAlert.dateCreated))
          cy.get('td')
            .eq(3)
            .contains(DateFormats.isoDateToUIDate(acctAlert.dateExpires as string))
        })
    })
  }
}
