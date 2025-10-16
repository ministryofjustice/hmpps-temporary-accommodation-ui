import type { Booking, Cas3Bedspace, Cas3Premises } from '@approved-premises/api'
import paths from '../../../../server/paths/temporary-accommodation/manage'
import BookingInfoComponent from '../../../components/bookingInfo'
import LocationHeaderComponent from '../../../components/locationHeader'
import PopDetailsHeaderComponent from '../../../components/popDetailsHeader'
import BookingDepartureEditablePage from './bookingDepartureEditable'

export default class BookingDepartureNewPage extends BookingDepartureEditablePage {
  private readonly popDetailsHeaderComponent: PopDetailsHeaderComponent

  private readonly locationHeaderComponent: LocationHeaderComponent

  private readonly bookingInfoComponent: BookingInfoComponent

  constructor(premises: Cas3Premises, bedspace: Cas3Bedspace, booking: Booking) {
    super('Mark booking as departed')

    this.locationHeaderComponent = new LocationHeaderComponent({ premises, bedspace })
    this.popDetailsHeaderComponent = new PopDetailsHeaderComponent(booking.person)
    this.bookingInfoComponent = new BookingInfoComponent(booking)
  }

  static visit(premises: Cas3Premises, bedspace: Cas3Bedspace, booking: Booking): BookingDepartureNewPage {
    cy.visit(paths.bookings.departures.new({ premisesId: premises.id, bedspaceId: bedspace.id, bookingId: booking.id }))
    return new BookingDepartureNewPage(premises, bedspace, booking)
  }

  shouldShowBookingDetails(): void {
    this.popDetailsHeaderComponent.shouldShowPopDetails()
    this.locationHeaderComponent.shouldShowLocationDetails()
    this.bookingInfoComponent.shouldShowBookingDetails()
  }
}
