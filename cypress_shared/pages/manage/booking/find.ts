import Page from '../../page'
import paths from '../../../../server/paths/manage'

export default class BookingFindPage extends Page {
  constructor() {
    super('Create a placement')
  }

  static visit(premisesId: string): BookingFindPage {
    cy.visit(paths.bookings.new({ premisesId }))
    return new BookingFindPage()
  }

  enterCrn(crn: string): void {
    this.getLabel("Enter the individual's CRN")
    this.getTextInputByIdAndEnterDetails('crn', crn)
  }

  completeForm(crn: string): void {
    this.enterCrn(crn)
    this.clickSubmit()
  }
}
