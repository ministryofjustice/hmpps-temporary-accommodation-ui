import type { Booking, NewExtension } from '@approved-premises/api'
import errorLookups from '../../../../server/i18n/en/errors.json'
import paths from '../../../../server/paths/temporary-accommodation/manage'
import { getLatestExtension } from '../../../../server/utils/bookingUtils'
import BookingInfoComponent from '../../../components/bookingInfo'
import LocationHeaderComponent from '../../../components/locationHeader'
import Page from '../../page'

export default class BookingExtensionNewPage extends Page {
  private readonly locationHeaderComponent: LocationHeaderComponent

  private readonly bookingInfoComponent: BookingInfoComponent

  constructor(private readonly booking: Booking) {
    super('Extend or shorten booking')

    this.locationHeaderComponent = new LocationHeaderComponent({ crn: booking.person.crn })
    this.bookingInfoComponent = new BookingInfoComponent(booking)
  }

  static visit(premisesId: string, roomId: string, booking: Booking): BookingExtensionNewPage {
    cy.visit(paths.bookings.extensions.new({ premisesId, roomId, bookingId: booking.id }))
    return new BookingExtensionNewPage(booking)
  }

  shouldShowBookingDetails(): void {
    this.locationHeaderComponent.shouldShowLocationDetails()
    this.bookingInfoComponent.shouldShowBookingDetails()

    this.shouldShowDateInputs('newDepartureDate', this.booking.departureDate)

    const latestExtension = getLatestExtension(this.booking)
    if (latestExtension) {
      cy.get('#notes').should('contain', latestExtension.notes)
    }
  }

  shouldShowDateConflictErrorMessages(): void {
    ;['newDepartureDate'].forEach(field => {
      cy.get('.govuk-error-summary').should('contain', errorLookups.generic[field].conflict)
      cy.get(`[data-cy-error-${field}]`).should('contain', errorLookups.generic[field].conflict)
    })
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
