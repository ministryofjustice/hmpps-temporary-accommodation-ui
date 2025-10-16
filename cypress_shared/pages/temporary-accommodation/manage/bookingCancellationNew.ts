import type { Booking, Cas3Bedspace, Cas3Premises } from '@approved-premises/api'
import paths from '../../../../server/paths/temporary-accommodation/manage'
import BookingInfoComponent from '../../../components/bookingInfo'
import LocationHeaderComponent from '../../../components/locationHeader'
import PopDetailsHeaderComponent from '../../../components/popDetailsHeader'
import BookingCancellationEditablePage from './bookingCancellationEditable'

export default class BookingCancellationNewPage extends BookingCancellationEditablePage {
  private readonly locationHeaderComponent: LocationHeaderComponent

  private readonly popDetailsHeaderComponent: PopDetailsHeaderComponent

  private readonly bookingInfoComponent: BookingInfoComponent

  constructor(premises: Cas3Premises, bedspace: Cas3Bedspace, booking: Booking) {
    super('Cancel booking')

    this.bookingInfoComponent = new BookingInfoComponent(booking)
    this.popDetailsHeaderComponent = new PopDetailsHeaderComponent(booking.person)
    this.locationHeaderComponent = new LocationHeaderComponent({ premises, bedspace })
  }

  static visit(premises: Cas3Premises, bedspace: Cas3Bedspace, booking: Booking): BookingCancellationNewPage {
    cy.visit(
      paths.bookings.cancellations.new({
        premisesId: premises.id,
        bedspaceId: bedspace.id,
        bookingId: booking.id,
      }),
    )
    return new BookingCancellationNewPage(premises, bedspace, booking)
  }

  shouldShowBookingDetails(): void {
    this.popDetailsHeaderComponent.shouldShowPopDetails()
    this.locationHeaderComponent.shouldShowLocationDetails(true)
    this.bookingInfoComponent.shouldShowBookingDetails()
  }
}
