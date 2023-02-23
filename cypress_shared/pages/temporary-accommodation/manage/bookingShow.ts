import type { Booking, Premises, Room } from '@approved-premises/api'

import paths from '../../../../server/paths/temporary-accommodation/manage'
import BookingInfoComponent from '../../../components/bookingInfo'
import Page from '../../page'

export default class BookingShowPage extends Page {
  private readonly bookingInfoComponent: BookingInfoComponent

  constructor(private readonly premises: Premises, private readonly room: Room, private readonly booking: Booking) {
    super('View a booking')

    this.bookingInfoComponent = new BookingInfoComponent(booking)
  }

  static visit(premises: Premises, room: Room, booking: Booking): BookingShowPage {
    cy.visit(paths.bookings.show({ premisesId: premises.id, roomId: room.id, bookingId: booking.id }))
    return new BookingShowPage(premises, room, booking)
  }

  clickConfirmBookingButton(): void {
    cy.get('.moj-page-header-actions').within(() => {
      cy.get('button').contains('Actions').click()
      cy.get('a').contains('Mark as confirmed').click()
    })
  }

  clickMarkArrivedBookingButton(): void {
    cy.get('.moj-page-header-actions').within(() => {
      cy.get('button').contains('Actions').click()
      cy.get('a').contains('Mark as active').click()
    })
  }

  clickMarkDepartedBookingButton(): void {
    cy.get('.moj-page-header-actions').within(() => {
      cy.get('button').contains('Actions').click()
      cy.get('a').contains('Mark as closed').click()
    })
  }

  clickExtendBookingButton(): void {
    cy.get('.moj-page-header-actions').within(() => {
      cy.get('button').contains('Actions').click()
      cy.get('a').contains('Extend or shorten booking').click()
    })
  }

  clickCancelBookingButton(): void {
    cy.get('.moj-page-header-actions').within(() => {
      cy.get('button').contains('Actions').click()
      cy.get('a').contains('Cancel booking').click()
    })
  }

  clickHistoryLink(): void {
    cy.get('a').contains('View booking history').click()
  }

  shouldShowBookingDetails(): void {
    cy.get('.location-header').within(() => {
      cy.get('p').should('contain', this.booking.person.crn)
      cy.get('p').should('contain', this.room.name)
      cy.get('p').should('contain', this.premises.addressLine1)
      cy.get('p').should('contain', this.premises.postcode)
    })

    this.bookingInfoComponent.shouldShowBookingDetails()
  }
}
