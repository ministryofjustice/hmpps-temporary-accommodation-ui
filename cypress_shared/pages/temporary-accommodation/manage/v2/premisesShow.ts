import Page from '../../../page'
import { Cas3Bedspace, Cas3Bedspaces, Cas3Premises } from '../../../../../server/@types/shared'
import { convertToTitleCase } from '../../../../../server/utils/utils'
import { DateFormats } from '../../../../../server/utils/dateUtils'
import paths from '../../../../../server/paths/temporary-accommodation/manage'

export default class PremisesShowPage extends Page {
  static visit(premises: Cas3Premises): PremisesShowPage {
    cy.visit(paths.premises.v2.show({ premisesId: premises.id }))
    return new PremisesShowPage(`${premises.addressLine1}, ${premises.postcode}`)
  }

  shouldShowPremisesOverview(premises: Cas3Premises, status: string, startDate: string): void {
    cy.get('main div .govuk-summary-card').within(() => {
      // should show property reference at the top of the summary card
      cy.get('h2').contains(premises.reference)

      // should show the property status
      cy.get('dl').contains('Property status').siblings().contains(status)

      // should show the property start date
      cy.get('dl').contains('Start date').siblings().contains(startDate)

      // should show the property address
      cy.get('dl')
        .contains('Address')
        .siblings()
        .contains(premises.addressLine1)
        .contains(premises.addressLine2)
        .contains(premises.town)
        .contains(premises.postcode)

      // should show the local authority
      cy.get('dl').contains('Local authority').siblings().contains(premises.localAuthorityArea.name)

      // should show the property region
      cy.get('dl').contains('Probation region').siblings().contains(premises.probationRegion.name)

      // should show the pdu
      cy.get('dl').contains('Probation delivery unit').siblings().contains(premises.probationDeliveryUnit.name)

      // should show the turn around time
      cy.get('dl')
        .contains('Expected turn around time')
        .siblings()
        .contains(`${premises.turnaroundWorkingDays} working days`)

      // should show the property detail tags
      cy.get('dl')
        .contains('Property details')
        .parent('.govuk-summary-list__row')
        .within(() => {
          premises.characteristics.forEach(characteristic => {
            cy.get('span').contains(characteristic.name)
          })
        })

      // should show the additional property details
      cy.get('dl').contains('Additional property details').siblings().contains(premises.notes)
    })
  }

  shouldShowUpcomingBedspaces(premises: Cas3Premises): void {
    cy.get('main h2')
      .contains('Property overview')
      .parent('div')
      .within(() => {
        cy.get('p').contains(`Upcoming bedspaces: ${premises.totalUpcomingBedspaces}`)
        cy.get('p').contains(`Online bedspaces: ${premises.totalOnlineBedspaces}`)
        cy.get('p').contains(`Archived bedspaces: ${premises.totalArchivedBedspaces}`)
      })
  }

  shouldNotShowUpcomingBedspaces(premises: Cas3Premises): void {
    cy.get('main h2')
      .contains('Property overview')
      .parent('div')
      .within(() => {
        cy.get('p').contains('Upcoming bedspaces').should('not.exist')
        cy.get('p').contains(`Online bedspaces: ${premises.totalOnlineBedspaces}`)
        cy.get('p').contains(`Archived bedspaces: ${premises.totalArchivedBedspaces}`)
      })
  }

  clickBedspacesOverviewTab(): void {
    cy.get('main nav a').contains('Bedspaces overview').click()
  }

  shouldShowBedspaceSummaries(bedspaces: Cas3Bedspaces): void {
    bedspaces.bedspaces.forEach(bedspace => {
      cy.get('main .govuk-summary-card h2')
        .contains(`Bedspace reference: ${bedspace.reference}`)
        .parents('.govuk-summary-card')
        .within(() => {
          cy.get('dl').contains('Bedspace status').siblings('dd').contains(convertToTitleCase(bedspace.status))
          cy.get('dl').contains('Start date').siblings('dd').contains(DateFormats.isoDateToUIDate(bedspace.startDate))
          bedspace.characteristics.forEach(characteristic => {
            cy.get('dl').contains('Bedspace details').siblings('dd').contains(characteristic.name)
          })
          cy.get('dl').contains('Additional bedspace details').siblings('dd').contains(bedspace.notes)
        })
    })
  }

  clickViewBedspaceLink(bedspace: Cas3Bedspace): void {
    cy.get('main .govuk-summary-card')
      .contains(`Bedspace reference: ${bedspace.reference}`)
      .parent()
      .find('a')
      .contains('View bedspace')
      .click()
  }

  shouldShowPropertyAddedBanner(): void {
    cy.get('main .govuk-notification-banner--success').contains('Property added')
  }
}
