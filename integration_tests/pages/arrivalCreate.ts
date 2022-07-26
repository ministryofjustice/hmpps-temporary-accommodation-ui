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

    cy.get('input[name="dateTime-day"]').type(String((arrival.dateTime as Date).getDate()))
    cy.get('input[name="dateTime-month"]').type(String((arrival.dateTime as Date).getMonth() + 1))
    cy.get('input[name="dateTime-year"]').type(String((arrival.dateTime as Date).getFullYear()))

    cy.get('input[name="expectedDeparture-day"]').type(String((arrival.expectedDeparture as Date).getDate()))
    cy.get('input[name="expectedDeparture-month"]').type(String((arrival.expectedDeparture as Date).getMonth() + 1))
    cy.get('input[name="expectedDeparture-year"]').type(String((arrival.expectedDeparture as Date).getFullYear()))

    cy.get('textarea[name="notes"]').type(arrival.notes)

    cy.get('button').click()
  }
}
