import type { Booking, Premises } from '@approved-premises/api'

import paths from '../../../../server/paths/temporary-accommodation/manage'
import BookingInfoComponent from '../../../components/bookingInfo'
import LocationHeaderComponent from '../../../components/locationHeader'
import PopDetailsHeaderComponent from '../../../components/popDetailsHeader'
import Page from '../../page'
import { Cas3Bedspace, Room } from '../../../../server/@types/shared'

export default class BookingShowPage extends Page {
  private readonly popDetailsHeaderComponent: PopDetailsHeaderComponent

  private readonly locationHeaderComponent: LocationHeaderComponent

  private readonly bookingInfoComponent: BookingInfoComponent

  constructor(
    premises: Premises,
    room: Room,
    bedspace: Cas3Bedspace,
    private readonly booking: Booking,
  ) {
    super('View a booking')

    this.popDetailsHeaderComponent = new PopDetailsHeaderComponent(booking.person)
    this.locationHeaderComponent = new LocationHeaderComponent({ premises, room, bedspace })
    this.bookingInfoComponent = new BookingInfoComponent(booking)
  }

  static visit(premises: Premises, room: Room, bedspace: Cas3Bedspace, booking: Booking): BookingShowPage {
    if (room) {
      cy.visit(paths.bookings.show({ premisesId: premises.id, roomId: room.id, bookingId: booking.id }))
    } else {
      cy.visit(paths.bookings.show({ premisesId: premises.id, bedspaceId: bedspace.id, bookingId: booking.id }))
    }
    return new BookingShowPage(premises, room, bedspace, booking)
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
    this.clickAction('Update departure details')
  }

  clickExtendBookingButton(): void {
    this.clickAction('Extend or shorten booking')
  }

  clickCancelBookingButton(): void {
    this.clickAction('Cancel booking')
  }

  clickEditArrivalButton(): void {
    this.clickAction('Change arrival date')
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

    if (this.booking.assessmentId) {
      this.popDetailsHeaderComponent.shouldHaveNameLink(paths.assessments.summary({ id: this.booking.assessmentId }))
    }
  }

  private clickAction(action: string) {
    cy.get('.moj-cas-page-header-actions').within(() => {
      cy.get('.moj-button-menu').then($button => {
        if ($button.find('.moj-button-menu__item').length > 0) {
          cy.wrap($button).click()
          cy.get('.moj-button-menu__item').contains(action).click()
        } else {
          cy.wrap($button).find('a').contains(action).click()
        }
      })
    })
  }
}
