import type { Booking } from 'approved-premises'
import Page, { PageElement } from './page'

export default class BookingPage extends Page {
  constructor() {
    super('Make a booking')
  }

  static visit(): BookingPage {
    cy.visit('/premises/premisesId/booking/new')
    return new BookingPage()
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
    return cy.get('#arrival-date-day')
  }

  arrivalMonth(): PageElement {
    return cy.get('#arrival-date-month')
  }

  arrivalYear(): PageElement {
    return cy.get('#arrival-date-year')
  }

  expectedDepartureDay(): PageElement {
    return cy.get('#expected-departure-date-day')
  }

  expectedDepartureMonth(): PageElement {
    return cy.get('#expected-departure-date-month')
  }

  expectedDepartureYear(): PageElement {
    return cy.get('#expected-departure-date-year')
  }

  clickSubmit(): void {
    cy.get('button').click()
  }

  completeForm(booking: Booking): void {
    this.getLabel('CRN')
    this.getTextInputByIdAndEnterDetails('CRN', booking.CRN)

    this.getLegend('What is the arrival date?')
    this.arrivalDay().type((booking.arrivalDate as Date).getDate().toString())
    this.arrivalMonth().type(`${(booking.arrivalDate as Date).getMonth() + 1}`)
    this.arrivalYear().type((booking.arrivalDate as Date).getFullYear().toString())

    this.getLegend('What is the expected departure date?')
    this.expectedDepartureDay().type((booking.expectedDepartureDate as Date).getDate().toString())
    this.expectedDepartureMonth().type(`${(booking.expectedDepartureDate as Date).getMonth() + 1}`)
    this.expectedDepartureYear().type((booking.expectedDepartureDate as Date).getFullYear().toString())

    this.getLabel('Key Worker')
    this.getSelectInputByIdAndSelectAnEntry('keyWorker', booking.keyWorker)
  }
}
