import type { Booking, Person } from 'approved-premises'
import Page, { PageElement } from '../page'
import paths from '../../../server/paths/manage'

export default class BookingNewPage extends Page {
  constructor() {
    super('Make a booking')
  }

  static visit(premisesId: string): BookingNewPage {
    cy.visit(paths.bookings.new({ premisesId }))

    return new BookingNewPage()
  }

  verifyPersonIsVisible(person: Person): void {
    cy.get('dl').within(() => {
      this.assertDefinition('Name', person.name)
      this.assertDefinition('CRN', person.crn)
    })
  }

  arrivalDay(): PageElement {
    return cy.get('#expectedArrivalDate-day')
  }

  arrivalMonth(): PageElement {
    return cy.get('#expectedArrivalDate-month')
  }

  arrivalYear(): PageElement {
    return cy.get('#expectedArrivalDate-year')
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
    this.getLegend('What is the expected arrival date?')

    const expectedArrivalDate = new Date(Date.parse(booking.expectedArrivalDate))

    this.arrivalDay().type(expectedArrivalDate.getDate().toString())
    this.arrivalMonth().type(`${expectedArrivalDate.getMonth() + 1}`)
    this.arrivalYear().type(expectedArrivalDate.getFullYear().toString())

    this.getLegend('What is the expected departure date?')

    const expectedDepartureDate = new Date(Date.parse(booking.expectedDepartureDate))

    this.expectedDepartureDay().type(expectedDepartureDate.getDate().toString())
    this.expectedDepartureMonth().type(`${expectedDepartureDate.getMonth() + 1}`)
    this.expectedDepartureYear().type(expectedDepartureDate.getFullYear().toString())

    this.getLabel('Key Worker')
    this.getSelectInputByIdAndSelectAnEntry('keyWorkerId', booking.keyWorker.name)
  }
}
