import type { NewBooking } from '@approved-premises/api'
import { TemporaryAccommodationPremises as Premises, Room } from '../../../../server/@types/shared'
import { PlaceContext } from '../../../../server/@types/ui'
import errorLookups from '../../../../server/i18n/en/errors.json'
import paths from '../../../../server/paths/temporary-accommodation/manage'
import LocationHeaderComponent from '../../../components/locationHeader'
import BedspaceStatusComponent from '../../../components/bedspaceStatus'
import BookingEditablePage from './bookingEditable'

export default class BookingNewPage extends BookingEditablePage {
  private readonly locationHeaderComponent: LocationHeaderComponent

  private readonly bedspaceStatusComponent: BedspaceStatusComponent

  constructor(
    private readonly premises: Premises,
    room: Room,
  ) {
    super('Book bedspace', premises, room)

    this.locationHeaderComponent = new LocationHeaderComponent({ premises, room })
    this.bedspaceStatusComponent = new BedspaceStatusComponent(room)
  }

  static visit(premises: Premises, room: Room): BookingNewPage {
    cy.visit(paths.bookings.new({ premisesId: premises.id, roomId: room.id }))
    return new BookingNewPage(premises, room)
  }

  assignTurnaroundDays(alias: string): void {
    cy.get('p')
      .contains(this.turnaroundText())
      .then(element => {
        const days = Number.parseInt(element.text().match(/\d+/)[0], 10)
        cy.wrap(days).as(alias)
      })
  }

  completeForm(newBooking: NewBooking): void {
    super.completeEditableForm(newBooking)
  }

  enterCrn(crn: string): void {
    super.getTextInputByIdAndEnterDetails('crn', crn)
  }

  shouldShowCrnDoesNotExistErrorMessage(): void {
    cy.get('.govuk-error-summary').should('contain', errorLookups.generic.crn.doesNotExist)
    cy.get(`[data-cy-error-crn]`).should('contain', errorLookups.generic.crn.doesNotExist)
  }

  shouldShowBookingDetails(): void {
    this.locationHeaderComponent.shouldShowLocationDetails(true)
    this.bedspaceStatusComponent.shouldShowStatusDetails('Online')

    cy.contains('p', this.turnaroundText())
  }

  shouldShowPrefilledBookingDetails(newBooking: NewBooking): void {
    this.shouldShowTextInputByLabel("What is the person's CRN", newBooking.crn)
    this.shouldShowDateInputsByLegend('What is the start date?', newBooking.arrivalDate)
    this.shouldShowDateInputsByLegend('What is the end date?', newBooking.departureDate)
  }

  shouldShowPrefilledBookingDetailsFromPlaceContext(placeContext: NonNullable<PlaceContext>): void {
    this.shouldShowTextInputByLabel("What is the person's CRN", placeContext.assessment.application.person.crn)
    this.shouldShowDateInputsByLegend('What is the start date?', placeContext.arrivalDate!)
  }

  private turnaroundText(): string {
    return `There will be a turnaround time of ${this.premises.turnaroundWorkingDayCount} working ${
      this.premises.turnaroundWorkingDayCount === 1 ? 'day' : 'days'
    } after this booking`
  }
}
