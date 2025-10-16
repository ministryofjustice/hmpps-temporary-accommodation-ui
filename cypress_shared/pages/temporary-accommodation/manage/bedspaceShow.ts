import type { Booking, Cas3Bedspace, Cas3Premises, LostBed } from '@approved-premises/api'

import paths from '../../../../server/paths/temporary-accommodation/manage'
import BookingListingComponent from '../../../components/bookingListing'
import LostBedListingComponent from '../../../components/lostBedListing'
import Page from '../../page'

export default class BedspaceShowPage extends Page {
  constructor(bedspace: Cas3Bedspace) {
    super(`Bedspace reference: ${bedspace.reference}`)
  }

  static visit(premises: Cas3Premises, bedspace: Cas3Bedspace): BedspaceShowPage {
    cy.visit(paths.premises.bedspaces.show({ premisesId: premises.id, bedspaceId: bedspace.id }))
    return new BedspaceShowPage(bedspace)
  }

  shouldShowBookingDetails(booking: Booking): void {
    const bookingListingComponent = new BookingListingComponent(booking)
    bookingListingComponent.shouldShowBookingDetails()
  }

  shouldShowLostBedDetails(lostBed: LostBed): void {
    const lostBedListingComponent = new LostBedListingComponent(lostBed)
    lostBedListingComponent.shouldShowLostBedDetails()
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

  clickBookingLink(booking: Booking): void {
    const bookingListingComponent = new BookingListingComponent(booking)
    bookingListingComponent.clickLink()
  }

  clickLostBedLink(lostBed: LostBed): void {
    const lostBedListingComponent = new LostBedListingComponent(lostBed)
    lostBedListingComponent.clickLink()
  }
}
