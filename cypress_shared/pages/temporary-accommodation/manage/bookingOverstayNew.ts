import type { Cas3Bedspace, Cas3Booking, Cas3Premises } from '@approved-premises/api'
import { NewOverstay } from '../../../../server/data/bookingClient'
import paths from '../../../../server/paths/temporary-accommodation/manage'
import BedspaceConflictErrorComponent from '../../../components/bedspaceConflictError'
import BookingInfoComponent from '../../../components/bookingInfo'
import LocationHeaderComponent from '../../../components/locationHeader'
import PopDetailsHeaderComponent from '../../../components/popDetailsHeader'
import Page from '../../page'

export default class BookingOverstayNewPage extends Page {
  private readonly bedspaceConflictErrorComponent: BedspaceConflictErrorComponent

  private readonly popDetailsHeaderComponent: PopDetailsHeaderComponent

  private readonly locationHeaderComponent: LocationHeaderComponent

  private readonly bookingInfoComponent: BookingInfoComponent

  constructor(
    premises: Cas3Premises,
    bedspace: Cas3Bedspace,
    private readonly booking: Cas3Booking,
  ) {
    super(`The new departure date means the booking is`)

    this.bedspaceConflictErrorComponent = new BedspaceConflictErrorComponent(premises, bedspace, 'booking')
    this.popDetailsHeaderComponent = new PopDetailsHeaderComponent(booking.person)
    this.locationHeaderComponent = new LocationHeaderComponent({ premises, bedspace })
    this.bookingInfoComponent = new BookingInfoComponent(booking)
  }

  static visit(premises: Cas3Premises, bedspace: Cas3Bedspace, booking: Cas3Booking): BookingOverstayNewPage {
    cy.visit(paths.bookings.overstays.new({ premisesId: premises.id, bedspaceId: bedspace.id, bookingId: booking.id }))
    return new BookingOverstayNewPage(premises, bedspace, booking)
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
