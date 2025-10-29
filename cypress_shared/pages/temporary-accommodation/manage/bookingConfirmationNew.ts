import type { Cas3Bedspace, Cas3Booking, Cas3Premises, NewConfirmation } from '@approved-premises/api'
import paths from '../../../../server/paths/temporary-accommodation/manage'
import BookingInfoComponent from '../../../components/bookingInfo'
import LocationHeaderComponent from '../../../components/locationHeader'
import PopDetailsHeaderComponent from '../../../components/popDetailsHeader'
import Page from '../../page'

export default class BookingConfirmationNewPage extends Page {
  private readonly popDetailsHeaderComponent: PopDetailsHeaderComponent

  private readonly locationHeaderComponent: LocationHeaderComponent

  private readonly bookingInfoComponent: BookingInfoComponent

  constructor(premises: Cas3Premises, bedspace: Cas3Bedspace, booking: Cas3Booking) {
    super('Mark booking as confirmed')

    this.popDetailsHeaderComponent = new PopDetailsHeaderComponent(booking.person)
    this.locationHeaderComponent = new LocationHeaderComponent({ premises, bedspace })
    this.bookingInfoComponent = new BookingInfoComponent(booking)
  }

  static visit(premises: Cas3Premises, bedspace: Cas3Bedspace, booking: Cas3Booking): BookingConfirmationNewPage {
    cy.visit(
      paths.bookings.confirmations.new({ premisesId: premises.id, bedspaceId: bedspace.id, bookingId: booking.id }),
    )
    return new BookingConfirmationNewPage(premises, bedspace, booking)
  }

  shouldShowBookingDetails(): void {
    this.popDetailsHeaderComponent.shouldShowPopDetails()
    this.locationHeaderComponent.shouldShowLocationDetails()
    this.bookingInfoComponent.shouldShowBookingDetails()
  }

  completeForm(newConfirmation: NewConfirmation): void {
    this.getLabel('Please provide any further details')
    this.getTextInputByIdAndEnterDetails('notes', newConfirmation.notes)

    this.clickSubmit()
  }
}
