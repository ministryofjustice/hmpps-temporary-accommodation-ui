import type { Booking, Premises, Room } from '@approved-premises/api'

import paths from '../../../../server/paths/temporary-accommodation/manage'
import BookingInfoComponent from '../../../components/bookingInfo'
import LocationHeaderComponent from '../../../components/locationHeader'
import PopDetailsHeaderComponent from '../../../components/popDetailsHeader'
import Page from '../../page'

export default class BookingShowPage extends Page {
  private readonly popDetailsHeaderComponent: PopDetailsHeaderComponent

  private readonly locationHeaderComponent: LocationHeaderComponent

  private readonly bookingInfoComponent: BookingInfoComponent

  constructor(premises: Premises, room: Room, booking: Booking) {
    super('View a booking')

    this.popDetailsHeaderComponent = new PopDetailsHeaderComponent(booking.person)
    this.locationHeaderComponent = new LocationHeaderComponent({ premises, room })
    this.bookingInfoComponent = new BookingInfoComponent(booking)
  }

  static visit(premises: Premises, room: Room, booking: Booking): BookingShowPage {
    cy.visit(paths.bookings.show({ premisesId: premises.id, roomId: room.id, bookingId: booking.id }))
    return new BookingShowPage(premises, room, booking)
  }

  clickConfirmBookingButton(): void {
    this.clickAction('Mark as confirmed')
  }

  clickMarkArrivedBookingButton(): void {
    this.clickAction('Mark as active')
  }

  clickMarkDepartedBookingButton(): void {
    this.clickAction('Mark as departed')
  }

  clickEditDepartedBookingButton(): void {
    this.clickAction('Change departure date')
  }

  clickExtendBookingButton(): void {
    this.clickAction('Extend or shorten booking')
  }

  clickCancelBookingButton(): void {
    this.clickAction('Cancel booking')
  }

  clickEditCancelledBookingButton(): void {
    this.clickAction('Update cancelled booking')
  }

  clickChangeTurnaround(): void {
    this.clickAction('Change turnaround time')
  }

  clickHistoryLink(): void {
    cy.get('a').contains('View booking history').click()
  }

  shouldShowBookingDetails(): void {
    this.popDetailsHeaderComponent.shouldShowPopDetails()
    this.locationHeaderComponent.shouldShowLocationDetails()
    this.bookingInfoComponent.shouldShowBookingDetails()
  }

  private clickAction(action: string) {
    cy.get('.moj-page-header-actions').within(() => {
      cy.get('button').contains('Actions').click()
      cy.get('a').contains(action).click()
    })
  }
}
