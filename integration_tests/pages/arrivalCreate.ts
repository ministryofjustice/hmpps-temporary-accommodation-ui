import type { Arrival, NonArrival } from 'approved-premises'

import Page from './page'

export default class ArrivalCreatePage extends Page {
  constructor(private readonly premisesId: string, private readonly bookingId: string) {
    super('Did the resident arrive?')
  }

  static visit(premisesId: string, bookingId: string): ArrivalCreatePage {
    cy.visit(`/premises/${premisesId}/bookings/${bookingId}/arrivals/new`)
    return new ArrivalCreatePage(premisesId, bookingId)
  }

  public completeArrivalForm(arrival: Arrival): void {
    cy.get('input[name="arrived"][value="Yes"]').check()

    cy.log('arrival', arrival)

    const date = new Date(Date.parse(arrival.date))
    const expectedDeparture = new Date(Date.parse(arrival.expectedDepartureDate))

    cy.get('input[name="date-day"]').type(String(date.getDate()))
    cy.get('input[name="date-month"]').type(String(date.getMonth() + 1))
    cy.get('input[name="date-year"]').type(String(date.getFullYear()))

    cy.get('input[name="expectedDepartureDate-day"]').type(String(expectedDeparture.getDate()))
    cy.get('input[name="expectedDepartureDate-month"]').type(String(expectedDeparture.getMonth() + 1))
    cy.get('input[name="expectedDepartureDate-year"]').type(String(expectedDeparture.getFullYear()))

    cy.get('[name="arrival[notes]"]').type(arrival.notes)

    cy.get('[name="arrival[submit]"]').click()
  }

  public completeNonArrivalForm(nonArrival: NonArrival): void {
    cy.get('input[name="arrived"][value="No"]').check()

    cy.log('nonArrival', nonArrival)

    const date = new Date(Date.parse(nonArrival.date))

    cy.get('input[name="nonArrivalDate-day"]').type(String(date.getDate()))
    cy.get('input[name="nonArrivalDate-month"]').type(String(date.getMonth() + 1))
    cy.get('input[name="nonArrivalDate-year"]').type(String(date.getFullYear()))

    cy.get('input[type="radio"]').last().check()

    cy.get('[name="nonArrival[notes]"]').type(nonArrival.notes)

    cy.get('[name="nonArrival[submit]"]').click()
  }
}
