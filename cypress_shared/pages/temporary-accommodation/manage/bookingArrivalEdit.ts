import type { Booking, LostBed, NewCas3Arrival as NewArrival, Premises, Room } from '@approved-premises/api'
import paths from '../../../../server/paths/temporary-accommodation/manage'
import BedspaceConflictErrorComponent from '../../../components/bedspaceConflictError'
import BookingInfoComponent from '../../../components/bookingInfo'
import LocationHeaderComponent from '../../../components/locationHeader'
import PopDetailsHeaderComponent from '../../../components/popDetailsHeader'
import Page from '../../page'

export default class BookingArrivalEditPage extends Page {
  private readonly bedspaceConflictErrorComponent: BedspaceConflictErrorComponent

  private readonly popDetailsHeaderComponent: PopDetailsHeaderComponent

  private readonly locationHeaderComponent: LocationHeaderComponent

  private readonly bookingInfoComponent: BookingInfoComponent

  constructor(
    premises: Premises,
    room: Room,
    private readonly booking: Booking,
  ) {
    super('Change arrival')

    this.bedspaceConflictErrorComponent = new BedspaceConflictErrorComponent(premises, room, 'booking')
    this.bookingInfoComponent = new BookingInfoComponent(booking)
    this.popDetailsHeaderComponent = new PopDetailsHeaderComponent(booking.person)
    this.locationHeaderComponent = new LocationHeaderComponent({ premises, room })
  }

  static visit(premises: Premises, room: Room, booking: Booking): BookingArrivalEditPage {
    cy.visit(paths.bookings.arrivals.edit({ premisesId: premises.id, roomId: room.id, bookingId: booking.id }))
    return new BookingArrivalEditPage(premises, room, booking)
  }

  shouldShowBookingDetails(): void {
    this.popDetailsHeaderComponent.shouldShowPopDetails()
    this.locationHeaderComponent.shouldShowLocationDetails()
    this.bookingInfoComponent.shouldShowBookingDetails()
    this.shouldShowEmptyDateInputs('arrivalDate')
  }

  shouldShowDateConflictErrorMessages(
    conflictingEntity: Booking | LostBed,
    conflictingEntityType: 'booking' | 'lost-bed',
  ): void {
    this.bedspaceConflictErrorComponent.shouldShowDateConflictErrorMessages(
      ['arrivalDate'],
      conflictingEntity,
      conflictingEntityType,
    )
  }

  completeForm(newArrival: NewArrival): void {
    this.clearForm()

    this.getLegend('What is the new arrival date?')
    this.completeDateInputs('arrivalDate', newArrival.arrivalDate)

    this.getLabel('Please provide any further details')
    this.getTextInputByIdAndEnterDetails('notes', newArrival.notes)

    this.clickSubmit()
  }

  clearForm(): void {
    this.clearDateInputs('arrivalDate')
    this.getTextInputByIdAndClear('notes')
  }
}
