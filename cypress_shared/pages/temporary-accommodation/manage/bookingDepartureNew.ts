import type { Booking, NewDeparture, Premises, Room } from '@approved-premises/api'
import paths from '../../../../server/paths/temporary-accommodation/manage'
import BookingInfoComponent from '../../../components/bookingInfo'
import LocationHeaderComponent from '../../../components/locationHeader'
import PopDetailsHeaderComponent from '../../../components/popDetailsHeader'
import Page from '../../page'

export default class BookingDepartureNewPage extends Page {
  private readonly popDetailsHeaderComponent: PopDetailsHeaderComponent

  private readonly locationHeaderComponent: LocationHeaderComponent

  private readonly bookingInfoComponent: BookingInfoComponent

  constructor(premises: Premises, room: Room, private readonly booking: Booking) {
    super('Mark booking as closed')

    this.locationHeaderComponent = new LocationHeaderComponent({ premises, room })
    this.popDetailsHeaderComponent = new PopDetailsHeaderComponent(booking.person)
    this.bookingInfoComponent = new BookingInfoComponent(booking)
  }

  static visit(premises: Premises, room: Room, booking: Booking): BookingDepartureNewPage {
    cy.visit(paths.bookings.departures.new({ premisesId: premises.id, roomId: room.id, bookingId: booking.id }))
    return new BookingDepartureNewPage(premises, room, booking)
  }

  shouldShowBookingDetails(): void {
    this.popDetailsHeaderComponent.shouldShowPopDetails()
    this.locationHeaderComponent.shouldShowLocationDetails()
    this.bookingInfoComponent.shouldShowBookingDetails()

    this.shouldShowDateInputs('dateTime', this.booking.departureDate)
  }

  completeForm(newDeparture: NewDeparture): void {
    this.clearForm()

    this.getLegend('What was the departure date?')
    this.completeDateInputs('dateTime', newDeparture.dateTime)

    this.getLabel('What was the departure reason?')
    this.getSelectInputByIdAndSelectAnEntry('reasonId', newDeparture.reasonId)

    this.getLabel('What was the move on category?')
    this.getSelectInputByIdAndSelectAnEntry('moveOnCategoryId', newDeparture.moveOnCategoryId)

    this.getLabel('Please provide any further details')
    this.getTextInputByIdAndEnterDetails('notes', newDeparture.notes)

    this.clickSubmit()
  }

  clearForm(): void {
    this.clearDateInputs('dateTime')
  }
}
