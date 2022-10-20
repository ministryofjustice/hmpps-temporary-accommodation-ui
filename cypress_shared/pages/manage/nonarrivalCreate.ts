import type { Nonarrival } from '@approved-premises/api'

import Page from '../page'
import paths from '../../../server/paths/manage'

export default class NonarrivalCreatePage extends Page {
  constructor(private readonly premisesId: string, private readonly bookingId: string) {
    super('Record a non-arrival')
  }

  static visit(premisesId: string, bookingId: string): NonarrivalCreatePage {
    cy.visit(paths.bookings.nonArrivals.new({ premisesId, bookingId }))
    return new NonarrivalCreatePage(premisesId, bookingId)
  }

  public completeNonArrivalForm(nonArrival: Nonarrival): void {
    const date = new Date(Date.parse(nonArrival.date))

    cy.get('input[name="nonArrivalDate-day"]').type(String(date.getDate()))
    cy.get('input[name="nonArrivalDate-month"]').type(String(date.getMonth() + 1))
    cy.get('input[name="nonArrivalDate-year"]').type(String(date.getFullYear()))

    cy.get('input[type="radio"]').last().check()

    cy.get('[name="nonArrival[notes]"]').type(nonArrival.notes)

    cy.get('[name="nonArrival[submit]"]').click()
  }

  public submitNonArrivalFormWithoutFields(): void {
    cy.get('[name="nonArrival[submit]"]').click()
  }
}
