import type { Cas3Bedspace, Cas3Booking, Cas3Premises, NewOverstay } from '@approved-premises/api'
import paths from '../../../../server/paths/temporary-accommodation/manage'
import BedspaceConflictErrorComponent from '../../../components/bedspaceConflictError'
import BookingInfoComponent from '../../../components/bookingInfo'
import LocationHeaderComponent from '../../../components/locationHeader'
import PopDetailsHeaderComponent from '../../../components/popDetailsHeader'
import Page from '../../page'
import { Cas3Overstay } from '../../../../server/@types/shared'
import { nightsBetween } from '../../../../server/utils/dateUtils'

export default class BookingOverstayNewPage extends Page {
  private readonly bedspaceConflictErrorComponent: BedspaceConflictErrorComponent

  private readonly popDetailsHeaderComponent: PopDetailsHeaderComponent

  private readonly locationHeaderComponent: LocationHeaderComponent

  private readonly bookingInfoComponent: BookingInfoComponent

  constructor(
    premises,
    bedspace,
    private readonly booking,
    overstay: Cas3Overstay | NewOverstay,
  ) {
    const overstayDays = nightsBetween(booking.arrivalDate, overstay.newDepartureDate) - 84
    super(`The new departure date means the booking is ${overstayDays} nights over the limit`)

    this.bedspaceConflictErrorComponent = new BedspaceConflictErrorComponent(premises, bedspace, 'booking')
    this.popDetailsHeaderComponent = new PopDetailsHeaderComponent(booking.person)
    this.locationHeaderComponent = new LocationHeaderComponent({ premises, bedspace })
    this.bookingInfoComponent = new BookingInfoComponent(booking)
  }

  static visit(
    premises: Cas3Premises,
    bedspace: Cas3Bedspace,
    booking: Cas3Booking,
    overstay: NewOverstay | Cas3Overstay,
  ): BookingOverstayNewPage {
    cy.visit(paths.bookings.overstays.new({ premisesId: premises.id, bedspaceId: bedspace.id, bookingId: booking.id }))
    return new BookingOverstayNewPage(premises, bedspace, booking, overstay)
  }

  shouldShowBookingDetails(): void {
    this.popDetailsHeaderComponent.shouldShowPopDetails()
    this.locationHeaderComponent.shouldShowLocationDetails()
    this.bookingInfoComponent.shouldShowBookingDetails()
  }

  completeForm(newOverstay: NewOverstay): void {
    this.clearForm()

    this.getLegend('Is this an authorised overstay?')
    this.checkRadioByNameAndValue('isAuthorised', newOverstay.isAuthorised ? 'yes' : 'no')

    if ('reason' in newOverstay) {
      this.getLabel('Reason for overstay (optional)')
      this.getTextInputByIdAndEnterDetails('reason', newOverstay.reason)
    }
    this.clickSubmit()
  }

  clearForm(): void {
    cy.get('body').then($body => {
      if ($body.find('#reason').length) this.getTextInputByIdAndClear('reason')
    })
  }
}
