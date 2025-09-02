import Page from '../../../page'
import { Cas3Bedspace, Cas3Premises, Cas3PremisesArchiveAction } from '../../../../../server/@types/shared'
import { convertToTitleCase } from '../../../../../server/utils/utils'
import { DateFormats } from '../../../../../server/utils/dateUtils'
import paths from '../../../../../server/paths/temporary-accommodation/manage'

export default class PremisesShowPage extends Page {
  constructor(premises: Cas3Premises) {
    super(`${premises.addressLine1}, ${premises.postcode}`)
  }

  static visit(premises: Cas3Premises): PremisesShowPage {
    cy.visit(paths.premises.show({ premisesId: premises.id }))
    return new PremisesShowPage(premises)
  }

  shouldShowPropertyStatus(status: string): void {
    cy.get('dl').contains('Property status').siblings().contains(status)
  }

  shouldShowScheduledDate(date: string): void {
    cy.get('dl').contains('Property status').siblings().contains(date)
  }

  shouldShowPropertyArchiveHistory(archiveHistory: Array<Cas3PremisesArchiveAction>): void {
    cy.get('dl')
      .contains('Archive history')
      .parent()
      .within(() => {
        archiveHistory.forEach(action => {
          const verb = action.status === 'online' ? 'Online' : 'Archive'
          const dateString = DateFormats.isoDateToUIDate(action.date)
          cy.contains(`${verb} date ${dateString}`)
        })
      })
  }

  shouldShowPremisesOverview(premises: Cas3Premises, status: string, startDate: string): void {
    cy.get('main div .govuk-summary-card').within(() => {
      // should show property reference at the top of the summary card
      cy.get('h2').contains(premises.reference)

      // should show the property status
      this.shouldShowPropertyStatus(status)

      // should show the property start date
      cy.get('dl').contains('Start date').siblings().contains(startDate)

      // should show archive history if it exists
      if (premises.archiveHistory && premises.archiveHistory.length > 0) {
        this.shouldShowPropertyArchiveHistory(premises.archiveHistory)
      }

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

  shouldShowBedspaceSummaries(bedspaces: Array<Cas3Bedspace>): void {
    bedspaces.forEach(bedspace => {
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

  shouldShowNoBedspaces(): void {
    cy.get('h2').contains('Bedspaces overview').siblings('p').contains('No bedspaces.')
  }

  shouldShowAddBedspaceLink(): void {
    cy.get('h2').contains('Bedspaces overview').siblings('a').contains('Add a bedspace')
  }

  clickNewBedspaceLink(): void {
    cy.get('h2').contains('Bedspaces overview').siblings('a').contains('Add a bedspace').click()
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

  shouldShowArchivedBanner(): void {
    cy.get('main .govuk-notification-banner h2').contains('Important')
    cy.get('main .govuk-notification-banner p').contains('This is an archived property')
    cy.get('main .govuk-notification-banner p').contains('You cannot create a new bedspace, or make a new booking.')
  }

  clickEditPropertyDetailsButton(): void {
    cy.get('button').contains('Actions').parent().click()
    cy.get('button').contains('Actions').parent().siblings('ul').contains('Edit property details').click()
  }

  shouldShowPropertyUpdatedBanner(): void {
    cy.get('main .govuk-notification-banner--success').contains('Property edited')
  }

  clickArchivePropertyButton(): void {
    cy.get('button').contains('Actions').parent().click()
    cy.get('button').contains('Actions').parent().siblings('ul').contains('Archive property').click()
  }

  shouldShowPropertyAndBedspacesArchivedBanner(): void {
    cy.get('main .govuk-notification-banner--success').contains('Property and bedspaces archived')
  }

  shouldShowPropertyAndBedspacesUpdatedBanner(): void {
    cy.get('main .govuk-notification-banner--success').contains('Property and bedspaces updated')
  }

  clickMakePropertyOnlineButton(): void {
    cy.get('button').contains('Actions').parent().click()
    cy.get('button').contains('Actions').parent().siblings('ul').contains('Make property online').click()
  }

  shouldShowPropertyAndBedspacesOnlineBanner(): void {
    cy.get('main .govuk-notification-banner--success').contains('Property and bedspaces online')
  }
}
