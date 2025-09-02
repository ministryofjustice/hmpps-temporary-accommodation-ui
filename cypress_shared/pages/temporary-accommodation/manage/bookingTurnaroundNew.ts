import type { Booking, Cas3Bedspace, LostBed, Premises, Room } from '@approved-premises/api'
import { NewTurnaround } from '../../../../server/@types/shared'
import paths from '../../../../server/paths/temporary-accommodation/manage'
import BedspaceConflictErrorComponent from '../../../components/bedspaceConflictError'
import BookingInfoComponent from '../../../components/bookingInfo'
import LocationHeaderComponent from '../../../components/locationHeader'
import PopDetailsHeaderComponent from '../../../components/popDetailsHeader'
import Page from '../../page'

const workingDaysLabel = 'What is the new turnaround time?'

export default class BookingTurnaroundNewPage extends Page {
  private readonly bedspaceConflictErrorComponent: BedspaceConflictErrorComponent

  private readonly popDetailsHeaderComponent: PopDetailsHeaderComponent

  private readonly locationHeaderComponent: LocationHeaderComponent

  private readonly bookingInfoComponent: BookingInfoComponent

  constructor(
    premises: Premises,
    room: Room,
    bedspace: Cas3Bedspace,
    private readonly booking: Booking,
  ) {
    super('Change turnaround time')

    this.bedspaceConflictErrorComponent = new BedspaceConflictErrorComponent(premises, room, bedspace, 'turnaround')
    this.popDetailsHeaderComponent = new PopDetailsHeaderComponent(booking.person)
    this.locationHeaderComponent = new LocationHeaderComponent({ premises, room, bedspace })
    this.bookingInfoComponent = new BookingInfoComponent(booking)
  }

  static visit(premises: Premises, room: Room, bedspace: Cas3Bedspace, booking: Booking): BookingTurnaroundNewPage {
    if (room) {
      cy.visit(paths.bookings.turnarounds.new({ premisesId: premises.id, bedspaceId: room.id, bookingId: booking.id }))
    } else {
      cy.visit(
        paths.bookings.turnarounds.new({ premisesId: premises.id, bedspaceId: bedspace.id, bookingId: booking.id }),
      )
    }
    return new BookingTurnaroundNewPage(premises, room, bedspace, booking)
  }

  shouldShowBookingDetails(): void {
    this.popDetailsHeaderComponent.shouldShowPopDetails()
    this.locationHeaderComponent.shouldShowLocationDetails(true)
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

  completeForm(newTurnaround: NewTurnaround): void {
    this.clearForm()

    this.completeTextInputByLabel(workingDaysLabel, `${newTurnaround.workingDays}`)

    this.clickSubmit()
  }

  clearForm(): void {
    this.clearTextInputByLabel(workingDaysLabel)
  }
}
