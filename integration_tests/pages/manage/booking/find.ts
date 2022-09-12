import Page from '../../page'
import paths from '../../../../server/paths/manage'

export default class BookingFindPage extends Page {
  constructor() {
    super('Make a booking')
  }

  static visit(premisesId: string): BookingFindPage {
    cy.visit(paths.bookings.new({ premisesId }))
    return new BookingFindPage()
  }

  enterCrn(crn: string): void {
    this.getLabel('Find someone by CRN')
    this.getTextInputByIdAndEnterDetails('crn', crn)
  }

  clickSubmit(): void {
    cy.get('button').click()
  }

  completeForm(crn: string): void {
    this.enterCrn(crn)
    this.clickSubmit()
  }
}
