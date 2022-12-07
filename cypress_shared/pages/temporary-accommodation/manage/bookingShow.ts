import type { Premises, Room, Booking } from '@approved-premises/api'

import Page from '../../page'
import paths from '../../../../server/paths/temporary-accommodation/manage'
import { DateFormats } from '../../../../server/utils/dateUtils'

export default class BookingShowPage extends Page {
  constructor(private readonly premises: Premises, private readonly room: Room, private readonly booking: Booking) {
    super('View a booking')
  }

  static visit(premises: Premises, room: Room, booking: Booking): BookingShowPage {
    cy.visit(paths.bookings.show({ premisesId: premises.id, roomId: room.id, bookingId: booking.id }))
    return new BookingShowPage(premises, room, booking)
  }

  clickConfirmBookingButton(): void {
    cy.get('.moj-identity-bar').within(() => {
      cy.get('button').contains('Actions').click()
      cy.get('a').contains('Mark as confirmed').click()
    })
  }

  clickMarkArrivedBookingButton(): void {
    cy.get('.moj-identity-bar').within(() => {
      cy.get('button').contains('Actions').click()
      cy.get('a').contains('Mark as active').click()
    })
  }

  clickMarkDepartedBookingButton(): void {
    cy.get('.moj-identity-bar').within(() => {
      cy.get('button').contains('Actions').click()
      cy.get('a').contains('Mark as closed').click()
    })
  }

  shouldShowBookingDetails(): void {
    cy.get('.location-header').within(() => {
      cy.get('p').should('contain', this.booking.person.crn)
      cy.get('p').should('contain', this.room.name)
      cy.get('p').should('contain', this.premises.addressLine1)
      cy.get('p').should('contain', this.premises.postcode)
    })

    const { status } = this.booking

    if (status === 'provisional' || status === 'confirmed') {
      this.shouldShowKeyAndValue('Start date', DateFormats.isoDateToUIDate(this.booking.arrivalDate))
      this.shouldShowKeyAndValue('End date', DateFormats.isoDateToUIDate(this.booking.departureDate))
    } else if (status === 'arrived') {
      this.shouldShowKeyAndValue('Arrival date', DateFormats.isoDateToUIDate(this.booking.arrivalDate))
      this.shouldShowKeyAndValue('Expected departure date', DateFormats.isoDateToUIDate(this.booking.departureDate))
    } else if (status === 'departed') {
      this.shouldShowKeyAndValue('Departure date', DateFormats.isoDateToUIDate(this.booking.departureDate))
    }

    if (status === 'provisional') {
      this.shouldShowKeyAndValue('Status', 'Provisional')
    } else if (status === 'confirmed') {
      this.shouldShowKeyAndValue('Status', 'Confirmed')
      this.shouldShowKeyAndValues('Notes', this.booking.confirmation.notes.split('\n'))
    } else if (status === 'arrived') {
      this.shouldShowKeyAndValue('Status', 'Active')
      this.shouldShowKeyAndValues('Notes', this.booking.arrival.notes.split('\n'))
    } else if (status === 'departed') {
      this.shouldShowKeyAndValue('Status', 'Closed')
      this.shouldShowKeyAndValue('Departure reason', this.booking.departure.reason.name)
      this.shouldShowKeyAndValue('Move on category', this.booking.departure.moveOnCategory.name)
      this.shouldShowKeyAndValues('Notes', this.booking.departure.notes.split('\n'))
    }
  }
}
