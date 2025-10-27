import type { Cas3Bedspace, Cas3Booking, Cas3Premises, Cas3VoidBedspace, NewExtension } from '@approved-premises/api'
import paths from '../../../../server/paths/temporary-accommodation/manage'
import { getLatestExtension } from '../../../../server/utils/bookingUtils'
import BedspaceConflictErrorComponent from '../../../components/bedspaceConflictError'
import BookingInfoComponent from '../../../components/bookingInfo'
import LocationHeaderComponent from '../../../components/locationHeader'
import PopDetailsHeaderComponent from '../../../components/popDetailsHeader'
import Page from '../../page'

export default class BookingExtensionNewPage extends Page {
  private readonly bedspaceConflictErrorComponent: BedspaceConflictErrorComponent

  private readonly popDetailsHeaderComponent: PopDetailsHeaderComponent

  private readonly locationHeaderComponent: LocationHeaderComponent

  private readonly bookingInfoComponent: BookingInfoComponent

  constructor(
    premises: Cas3Premises,
    bedspace: Cas3Bedspace,
    private readonly booking: Cas3Booking,
  ) {
    super('Extend or shorten booking')

    this.bedspaceConflictErrorComponent = new BedspaceConflictErrorComponent(premises, bedspace, 'booking')
    this.popDetailsHeaderComponent = new PopDetailsHeaderComponent(booking.person)
    this.locationHeaderComponent = new LocationHeaderComponent({ premises, bedspace })
    this.bookingInfoComponent = new BookingInfoComponent(booking)
  }

  static visit(premises: Cas3Premises, bedspace: Cas3Bedspace, booking: Cas3Booking): BookingExtensionNewPage {
    cy.visit(paths.bookings.extensions.new({ premisesId: premises.id, bedspaceId: bedspace.id, bookingId: booking.id }))
    return new BookingExtensionNewPage(premises, bedspace, booking)
  }

  shouldShowBookingDetails(): void {
    this.popDetailsHeaderComponent.shouldShowPopDetails()
    this.locationHeaderComponent.shouldShowLocationDetails()
    this.bookingInfoComponent.shouldShowBookingDetails()

    this.shouldShowDateInputs('newDepartureDate', this.booking.departureDate)

    const latestExtension = getLatestExtension(this.booking)
    if (latestExtension) {
      cy.get('#notes').should('contain', latestExtension.notes)
    }
  }

  shouldShowDateConflictErrorMessages(
    conflictingEntity: Cas3Booking | Cas3VoidBedspace,
    conflictingEntityType: 'booking' | 'lost-bed',
  ): void {
    this.bedspaceConflictErrorComponent.shouldShowDateConflictErrorMessages(
      ['newDepartureDate'],
      conflictingEntity,
      conflictingEntityType,
    )
  }

  completeForm(newExtension: NewExtension): void {
    this.clearForm()

    this.getLegend('What is the new departure date?')
    this.completeDateInputs('newDepartureDate', newExtension.newDepartureDate)

    this.getLabel('Please provide any further details')
    this.getTextInputByIdAndEnterDetails('notes', newExtension.notes)

    this.clickSubmit()
  }

  clearForm(): void {
    this.clearDateInputs('newDepartureDate')
    this.getTextInputByIdAndClear('notes')
  }
}
