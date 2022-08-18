import type { Booking } from 'approved-premises'
import Page, { PageElement } from './page'

export default class BookingCreatePage extends Page {
  constructor() {
    super('Make a booking')
  }

  static visit(premisesId: string): BookingCreatePage {
    cy.visit(`/premises/${premisesId}/bookings/new`)
    return new BookingCreatePage()
  }

  getLabel(labelName: string): void {
    cy.get('label').should('contain', labelName)
  }

  getLegend(legendName: string): void {
    cy.get('legend').should('contain', legendName)
  }

  getTextInputByIdAndEnterDetails(id: string, details: string): void {
    cy.get(`#${id}`).type(details)
  }

  getSelectInputByIdAndSelectAnEntry(id: string, entry: string): void {
    cy.get(`#${id}`).select(entry)
  }

  arrivalDay(): PageElement {
    return cy.get('#arrivalDate-day')
  }

  arrivalMonth(): PageElement {
    return cy.get('#arrivalDate-month')
  }

  arrivalYear(): PageElement {
    return cy.get('#arrivalDate-year')
  }

  expectedDepartureDay(): PageElement {
    return cy.get('#expectedDepartureDate-day')
  }

  expectedDepartureMonth(): PageElement {
    return cy.get('#expectedDepartureDate-month')
  }

  expectedDepartureYear(): PageElement {
    return cy.get('#expectedDepartureDate-year')
  }

  clickSubmit(): void {
    cy.get('button').click()
  }

  completeForm(booking: Booking): void {
    this.getLabel('CRN')
    this.getTextInputByIdAndEnterDetails('crn', booking.crn)

    this.getLabel('Name')
    this.getTextInputByIdAndEnterDetails('name', booking.name)

    this.getLegend('What is the arrival date?')

    const arrivalDate = new Date(Date.parse(booking.arrivalDate))

    this.arrivalDay().type(arrivalDate.getDate().toString())
    this.arrivalMonth().type(`${arrivalDate.getMonth() + 1}`)
    this.arrivalYear().type(arrivalDate.getFullYear().toString())

    this.getLegend('What is the expected departure date?')

    const expectedDepartureDate = new Date(Date.parse(booking.expectedDepartureDate))

    this.expectedDepartureDay().type(expectedDepartureDate.getDate().toString())
    this.expectedDepartureMonth().type(`${expectedDepartureDate.getMonth() + 1}`)
    this.expectedDepartureYear().type(expectedDepartureDate.getFullYear().toString())

    this.getLabel('Key Worker')
    this.getSelectInputByIdAndSelectAnEntry('keyWorker', booking.keyWorker)
  }
}
