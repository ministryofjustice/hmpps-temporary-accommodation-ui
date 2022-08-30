import Page, { PageElement } from '../../page'

export default class BookingExtensionCreatePage extends Page {
  constructor() {
    super('Extend booking')
  }

  static visit(premisesId: string, bookingId: string): BookingExtensionCreatePage {
    cy.visit(`/premises/${premisesId}/bookings/${bookingId}/extensions/new`)
    return new BookingExtensionCreatePage()
  }

  newDepartureDay(): PageElement {
    return cy.get('#newDepartureDate-day')
  }

  newDepartureMonth(): PageElement {
    return cy.get('#newDepartureDate-month')
  }

  newDepartureYear(): PageElement {
    return cy.get('#newDepartureDate-year')
  }

  clickSubmit(): void {
    cy.get('button').click()
  }

  completeForm(newDepartureDate: string): void {
    this.getLegend('What is the extended expected departure date?')

    const parsedNewDepartureDate = new Date(Date.parse(newDepartureDate))

    this.newDepartureDay().type(parsedNewDepartureDate.getDate().toString())
    this.newDepartureMonth().type(`${parsedNewDepartureDate.getMonth() + 1}`)
    this.newDepartureYear().type(parsedNewDepartureDate.getFullYear().toString())
  }
}
