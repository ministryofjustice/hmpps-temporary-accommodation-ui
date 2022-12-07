import type { Booking, NewExtension } from '@approved-premises/api'
import { DateFormats } from '../../../../server/utils/dateUtils'
import Page from '../../page'
import errorLookups from '../../../../server/i18n/en/errors.json'

export default class BookingExtensionNewPage extends Page {
  constructor(private readonly booking: Booking) {
    super('Extend or shorten booking')
  }

  shouldShowBookingDetails(): void {
    cy.get('.location-header').within(() => {
      cy.get('p').should('contain', this.booking.person.crn)
    })

    this.shouldShowKeyAndValue('Arrival date', DateFormats.isoDateToUIDate(this.booking.arrivalDate))
    this.shouldShowKeyAndValue('Expected departure date', DateFormats.isoDateToUIDate(this.booking.departureDate))
    this.shouldShowKeyAndValues('Notes', this.booking.arrival.notes.split('\n'))

    this.shouldShowDateInputs('newDepartureDate', this.booking.departureDate)
  }

  shouldShowDateConflictErrorMessages(): void {
    ;['newDepartureDate'].forEach(field => {
      cy.get('.govuk-error-summary').should('contain', errorLookups[field].conflict)
      cy.get(`[data-cy-error-${field}]`).should('contain', errorLookups[field].conflict)
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
  }
}
