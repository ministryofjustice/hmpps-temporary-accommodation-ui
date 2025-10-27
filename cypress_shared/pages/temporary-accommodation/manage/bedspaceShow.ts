import type { Cas3Bedspace, Cas3Booking, Cas3Premises, Cas3VoidBedspace } from '@approved-premises/api'

import paths from '../../../../server/paths/temporary-accommodation/manage'
import BookingListingComponent from '../../../components/bookingListing'
import LostBedListingComponent from '../../../components/lostBedListing'
import Page from '../../page'
import { DateFormats } from '../../../../server/utils/dateUtils'

export default class BedspaceShowPage extends Page {
  constructor(
    private readonly premises: Cas3Premises,
    private readonly bedspace: Cas3Bedspace,
  ) {
    super(`Bedspace reference: ${bedspace.reference}`)
  }

  static visit(premises: Cas3Premises, bedspace: Cas3Bedspace): BedspaceShowPage {
    cy.visit(paths.premises.bedspaces.show({ premisesId: premises.id, bedspaceId: bedspace.id }))
    return new BedspaceShowPage(premises, bedspace)
  }

  shouldShowStatus(status: string): void {
    cy.get('main dl').get('dd').eq(0).contains(status)
  }

  shouldShowStartDate(startDate: string): void {
    cy.get('main dl').get('dd').eq(1).contains(startDate)
  }

  shouldShowDetails(): void {
    this.bedspace.characteristics.forEach(characteristic => {
      cy.get('main dl').get('dd').eq(2).contains(characteristic.name)
    })
  }

  shouldShowAdditionalDetails(): void {
    cy.get('main dl').get('dd').eq(3).contains(this.bedspace.notes)
  }

  shouldShowPropertyAddress(): void {
    cy.get('main div h2').contains('Property address').parent('div').children('p').as('propertyAddress')

    cy.get('@propertyAddress')
      .contains(this.premises.addressLine1)
      .contains(this.premises.addressLine2)
      .contains(this.premises.town)
      .contains(this.premises.postcode)
  }

  shouldShowPropertyDetails(): void {
    cy.get('main div h2')
      .contains('Property details')
      .parent('div')
      .children('p')
      .children('span')
      .as('propertyDetails')

    this.premises.characteristics.forEach(characteristic => {
      cy.get('@propertyDetails').contains(characteristic.name)
    })
  }

  shouldShowNoPropertyDetails(): void {
    cy.get('main div h2').contains('Property details').parent('div').children('p').contains('None')
  }

  shouldShowNoBookings(): void {
    cy.get('main').contains('No bookings.')
  }

  shouldShowBookingDetails(booking: Cas3Booking): void {
    const bookingListingComponent = new BookingListingComponent(booking)
    bookingListingComponent.shouldShowBookingDetails()
  }

  shouldShowLostBedDetails(lostBed: Cas3VoidBedspace): void {
    const lostBedListingComponent = new LostBedListingComponent(lostBed)
    lostBedListingComponent.shouldShowLostBedDetails()
  }

  clickAction(action: string): void {
    cy.get('body').then($body => {
      if ($body.find('button:contains("Actions")').length > 0) {
        cy.get('button').contains('Actions').parent().click()
        cy.get('button').contains('Actions').parent().siblings('ul').contains(action).click()
      } else {
        cy.get('[role="button"]').contains(action).click()
      }
    })
  }

  shouldShowBedspaceUpdatedBanner(): void {
    cy.get('main .govuk-notification-banner--success').contains('Bedspace edited')
  }

  clickBookBedspaceLink(): void {
    cy.get('.moj-cas-page-header-actions').within(() => {
      cy.get('.moj-button-menu').should('contain.text', 'Actions').click()
      cy.get('a').contains('Book bedspace').click()
    })
  }

  clickVoidBedspaceLink(): void {
    cy.get('.moj-cas-page-header-actions').within(() => {
      cy.get('.moj-button-menu').contains('Actions').click()
      cy.get('a').contains('Void bedspace').click()
    })
  }

  clickBookingLink(booking: Cas3Booking): void {
    const bookingListingComponent = new BookingListingComponent(booking)
    bookingListingComponent.clickLink()
  }

  clickLostBedLink(lostBed: Cas3VoidBedspace): void {
    const lostBedListingComponent = new LostBedListingComponent(lostBed)
    lostBedListingComponent.clickLink()
  }

  confirmCancelArchive() {
    cy.get('main').contains('Yes').click()
    cy.get('main').contains('Submit').click()
  }

  shouldShowCancelArchive(bedspace: Cas3Bedspace): void {
    const endDate = DateFormats.isoDateToUIDate(bedspace.endDate)

    cy.get('main').contains(`Are you sure you want to cancel the scheduled archive on ${endDate}?`)
    cy.get('main').contains('Yes, I want to cancel it')
    cy.get('main').contains('No')
    cy.get('main').contains('Submit')
  }

  confirmCancelUnarchive() {
    cy.get('main').contains('Yes').click()
    cy.get('main').contains('Submit').click()
  }

  shouldShowCancelUnarchive(bedspace: Cas3Bedspace): void {
    const scheduleUnarchiveDate = DateFormats.isoDateToUIDate(bedspace.scheduleUnarchiveDate)

    cy.get('main').contains(`Are you sure you want to cancel the scheduled online date of ${scheduleUnarchiveDate}?`)
    cy.get('main').contains('Yes, I want to cancel it')
    cy.get('main').contains('No')
    cy.get('main').contains('Submit')
  }

  clickArchiveLink(): void {
    // Click the Archive link
    cy.get('.moj-cas-page-header-actions .moj-button-menu__toggle-button').then($toggleButtons => {
      if ($toggleButtons.length > 0) {
        // Dropdown exists - click it first
        cy.wrap($toggleButtons.first()).click()
      }
    })
    cy.get('.moj-cas-page-header-actions a').contains('Archive bedspace').click()
  }

  clickUnarchiveLink(): void {
    // Click the Unarchive link
    cy.get('.moj-cas-page-header-actions .moj-button-menu__toggle-button').then($toggleButtons => {
      if ($toggleButtons.length > 0) {
        // Dropdown exists - click it first
        cy.wrap($toggleButtons.first()).click()
      }
    })
    cy.get('.moj-cas-page-header-actions a').contains('Make bedspace online').click()
  }

  shouldShowAsOnline(): void {
    cy.get('.govuk-tag').should('contain', 'Online')
  }

  shouldShowAsArchived(): void {
    cy.get('.govuk-tag').should('contain', 'Archived')
  }

  shouldShowArchiveLink(): void {
    cy.get('.moj-cas-page-header-actions').within(() => {
      cy.root().should('contain', 'Archive')
    })
  }

  shouldNotShowArchiveLink(): void {
    cy.get('.moj-cas-page-header-actions').within(() => {
      cy.root().should('not.contain', 'Archive')
    })
  }
}
