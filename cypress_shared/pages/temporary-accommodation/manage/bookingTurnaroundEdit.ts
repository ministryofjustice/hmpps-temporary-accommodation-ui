import type { Booking, LostBed, Premises, Room } from '@approved-premises/api'
import { UpdateTurnaround } from '../../../../server/@types/shared'
import paths from '../../../../server/paths/temporary-accommodation/manage'
import BedspaceConflictErrorComponent from '../../../components/bedspaceConflictError'
import BookingInfoComponent from '../../../components/bookingInfo'
import LocationHeaderComponent from '../../../components/locationHeader'
import PopDetailsHeaderComponent from '../../../components/popDetailsHeader'
import Page from '../../page'

const workingDaysLabel = 'What is the new turnaround time?'

export default class BookingTurnaroundEditPage extends Page {
  private readonly bedspaceConflictErrorComponent: BedspaceConflictErrorComponent

  private readonly popDetailsHeaderComponent: PopDetailsHeaderComponent

  private readonly locationHeaderComponent: LocationHeaderComponent

  private readonly bookingInfoComponent: BookingInfoComponent

  constructor(premises: Premises, room: Room, private readonly booking: Booking) {
    super('Change turnaround time')

    this.bedspaceConflictErrorComponent = new BedspaceConflictErrorComponent(premises, room, 'turnaround')
    this.popDetailsHeaderComponent = new PopDetailsHeaderComponent(booking.person)
    this.locationHeaderComponent = new LocationHeaderComponent({ premises, room })
    this.bookingInfoComponent = new BookingInfoComponent(booking)
  }

  static visit(premises: Premises, room: Room, booking: Booking): BookingTurnaroundEditPage {
    cy.visit(paths.bookings.turnarounds.edit({ premisesId: premises.id, roomId: room.id, bookingId: booking.id }))
    return new BookingTurnaroundEditPage(premises, room, booking)
  }

  shouldShowBookingDetails(): void {
    this.popDetailsHeaderComponent.shouldShowPopDetails()
    this.locationHeaderComponent.shouldShowLocationDetails()
    this.bookingInfoComponent.shouldShowBookingDetails()

    this.shouldShowTextInputByLabel(workingDaysLabel, `${this.booking.turnaround.workingDays}`)
  }

  shouldShowDateConflictErrorMessages(
    conflictingEntity: Booking | LostBed,
    conflictingEntityType: 'booking' | 'lost-bed',
  ): void {
    this.bedspaceConflictErrorComponent.shouldShowDateConflictErrorMessages(
      ['workingDays'],
      conflictingEntity,
      conflictingEntityType,
    )
  }

  completeForm(updateTurnaround: UpdateTurnaround): void {
    this.clearForm()

    this.completeTextInputByLabel(workingDaysLabel, `${updateTurnaround.workingDays}`)

    this.clickSubmit()
  }

  clearForm(): void {
    this.clearTextInputByLabel(workingDaysLabel)
  }
}
