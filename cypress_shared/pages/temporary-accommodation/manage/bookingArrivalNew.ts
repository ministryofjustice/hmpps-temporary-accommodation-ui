import type { Booking, LostBed, NewArrival, Premises, Room } from '@approved-premises/api'
import paths from '../../../../server/paths/temporary-accommodation/manage'
import BedspaceConflictErrorComponent from '../../../components/bedspaceConflictError'
import BookingInfoComponent from '../../../components/bookingInfo'
import LocationHeaderComponent from '../../../components/locationHeader'
import PopDetailsHeaderComponent from '../../../components/popDetailsHeader'
import Page from '../../page'

export default class BookingArrivalNewPage extends Page {
  private readonly bedspaceConflictErrorComponent: BedspaceConflictErrorComponent

  private readonly popDetailsHeaderComponent: PopDetailsHeaderComponent

  private readonly locationHeaderComponent: LocationHeaderComponent

  private readonly bookingInfoComponent: BookingInfoComponent

  constructor(premises: Premises, room: Room, private readonly booking: Booking) {
    super('Mark booking as active')

    this.bedspaceConflictErrorComponent = new BedspaceConflictErrorComponent(premises, room)
    this.bookingInfoComponent = new BookingInfoComponent(booking)
    this.popDetailsHeaderComponent = new PopDetailsHeaderComponent(booking.person)
    this.locationHeaderComponent = new LocationHeaderComponent({ premises, room })
  }

  static visit(premises: Premises, room: Room, booking: Booking): BookingArrivalNewPage {
    cy.visit(paths.bookings.arrivals.new({ premisesId: premises.id, roomId: room.id, bookingId: booking.id }))
    return new BookingArrivalNewPage(premises, room, booking)
  }

  shouldShowBookingDetails(): void {
    this.popDetailsHeaderComponent.shouldShowPopDetails()
    this.locationHeaderComponent.shouldShowLocationDetails()
    this.bookingInfoComponent.shouldShowBookingDetails()

    this.shouldShowDateInputs('arrivalDate', this.booking.arrivalDate)
    this.shouldShowDateInputs('expectedDepartureDate', this.booking.departureDate)
  }

  shouldShowDateConflictErrorMessages(
    conflictingEntity: Booking | LostBed,
    conflictingEntityType: 'booking' | 'lost-bed',
  ): void {
    this.bedspaceConflictErrorComponent.shouldShowDateConflictErrorMessages(
      ['arrivalDate', 'expectedDepartureDate'],
      conflictingEntity,
      conflictingEntityType,
    )
  }

  completeForm(newArrival: NewArrival): void {
    this.clearForm()

    this.getLegend('What was the arrival date?')
    this.completeDateInputs('arrivalDate', newArrival.arrivalDate)

    this.getLegend('What is the expected departure date?')
    this.completeDateInputs('expectedDepartureDate', newArrival.expectedDepartureDate)

    this.getLabel('Please provide any further details')
    this.getTextInputByIdAndEnterDetails('notes', newArrival.notes)

    this.clickSubmit()
  }

  clearForm(): void {
    this.clearDateInputs('arrivalDate')
    this.clearDateInputs('expectedDepartureDate')
  }
}
