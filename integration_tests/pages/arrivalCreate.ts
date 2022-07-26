import type { Arrival } from 'approved-premises'

import Page from './page'

export default class ArrivalCreatePage extends Page {
  constructor(private readonly premisesId: string, private readonly bookingId: string) {
    super('Did the resident arrive?')
  }

  static visit(premisesId: string, bookingId: string): ArrivalCreatePage {
    cy.visit(`/premises/${premisesId}/bookings/${bookingId}/arrivals/new`)
    return new ArrivalCreatePage(premisesId, bookingId)
  }

  public completeForm(arrival: Arrival): void {
    cy.get('input[name="arrived"][value="Yes"]').check()

    cy.log('arrival', arrival)

    const dateTime = new Date(Date.parse(arrival.dateTime))
    const expectedDeparture = new Date(Date.parse(arrival.expectedDeparture))

    cy.get('input[name="dateTime-day"]').type(String(dateTime.getDate()))
    cy.get('input[name="dateTime-month"]').type(String(dateTime.getMonth() + 1))
    cy.get('input[name="dateTime-year"]').type(String(dateTime.getFullYear()))

    cy.get('input[name="expectedDeparture-day"]').type(String(expectedDeparture.getDate()))
    cy.get('input[name="expectedDeparture-month"]').type(String(expectedDeparture.getMonth() + 1))
    cy.get('input[name="expectedDeparture-year"]').type(String(expectedDeparture.getFullYear()))

    cy.get('textarea[name="notes"]').type(arrival.notes)

    cy.get('button').click()
  }
}
