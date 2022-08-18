import type { Cancellation } from 'approved-premises'
import Page from './page'

export default class CancellationCreatePage extends Page {
  constructor() {
    super('Cancel this placement')
  }

  static visit(premisesId: string, bookingId: string): CancellationCreatePage {
    cy.visit(`/premises/${premisesId}/bookings/${bookingId}/cancellations/new`)
    return new CancellationCreatePage()
  }

  clickSubmit(): void {
    cy.get('button').click()
  }

  completeForm(cancellation: Cancellation): void {
    this.getLegend('Date of Cancellation')
    this.completeDateInputs('date', cancellation.date)

    this.getLegend('What is the reason for cancelling this placement?')
    this.checkRadioByNameAndValue('cancellation[reason]', cancellation.reason.id)

    this.getLabel('Additional notes')
    this.completeTextArea('cancellation[notes]', cancellation.notes)

    this.clickSubmit()
  }
}
