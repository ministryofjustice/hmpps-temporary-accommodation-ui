import Page from '../../../page'
import { Booking, Cas3Bedspace, Cas3Premises, LostBed } from '../../../../../server/@types/shared'
import paths from '../../../../../server/paths/temporary-accommodation/manage'
import BookingListingComponent from '../../../../components/bookingListing'
import LostBedListingComponent from '../../../../components/lostBedListing'

export default class BedspaceShowPage extends Page {
  constructor(
    private readonly premises: Cas3Premises,
    private readonly bedspace: Cas3Bedspace,
  ) {
    super(`Bedspace reference: ${bedspace.reference}`)
  }

  static visit(premises: Cas3Premises, bedspace: Cas3Bedspace): BedspaceShowPage {
    cy.visit(paths.premises.v2.bedspaces.show({ premisesId: premises.id, bedspaceId: bedspace.id }))
    return new BedspaceShowPage(premises, bedspace)
  }

  shouldShowStatus(status: string): void {
    cy.get('main dl').get('dd').eq(0).contains(status)
  }

  shouldShowStartDate(startDate: string): void {
    cy.get('main dl').get('dd').eq(1).contains(startDate)
  }

  shouldShowDetails(): void {
    this.bedspace.characteristics.forEach(characteristic => {
      cy.get('main dl').get('dd').eq(2).contains(characteristic.name)
    })
  }

  shouldShowAdditionalDetails(): void {
    cy.get('main dl').get('dd').eq(3).contains(this.bedspace.notes)
  }

  shouldShowNoBookings(): void {
    cy.get('main').contains('No bookings.')
  }

  shouldShowBookingDetails(booking: Booking): void {
    const bookingListingComponent = new BookingListingComponent(booking)
    bookingListingComponent.shouldShowBookingDetails()
  }

  shouldShowLostBedDetails(lostBed: LostBed): void {
    const lostBedListingComponent = new LostBedListingComponent(lostBed)
    lostBedListingComponent.shouldShowLostBedDetails()
  }
}
