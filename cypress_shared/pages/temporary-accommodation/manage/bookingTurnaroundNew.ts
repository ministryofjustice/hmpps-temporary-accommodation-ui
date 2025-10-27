import type { Cas3Bedspace, Cas3Booking, Cas3Premises, Cas3VoidBedspace, NewTurnaround } from '@approved-premises/api'
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
    premises: Cas3Premises,
    bedspace: Cas3Bedspace,
    private readonly booking: Cas3Booking,
  ) {
    super('Change turnaround time')

    this.bedspaceConflictErrorComponent = new BedspaceConflictErrorComponent(premises, bedspace, 'turnaround')
    this.popDetailsHeaderComponent = new PopDetailsHeaderComponent(booking.person)
    this.locationHeaderComponent = new LocationHeaderComponent({ premises, bedspace })
    this.bookingInfoComponent = new BookingInfoComponent(booking)
  }

  static visit(premises: Cas3Premises, bedspace: Cas3Bedspace, booking: Cas3Booking): BookingTurnaroundNewPage {
    cy.visit(
      paths.bookings.turnarounds.new({ premisesId: premises.id, bedspaceId: bedspace.id, bookingId: booking.id }),
    )
    return new BookingTurnaroundNewPage(premises, bedspace, booking)
  }

  shouldShowBookingDetails(): void {
    this.popDetailsHeaderComponent.shouldShowPopDetails()
    this.locationHeaderComponent.shouldShowLocationDetails(true)
    this.bookingInfoComponent.shouldShowBookingDetails()

    this.shouldShowTextInputByLabel(workingDaysLabel, `${this.booking.turnaround.workingDays}`)
  }

  shouldShowDateConflictErrorMessages(
    conflictingEntity: Cas3Booking | Cas3VoidBedspace,
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
