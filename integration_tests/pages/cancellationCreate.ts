import type { Cancellation } from 'approved-premises'
import Page from './page'
import paths from '../../server/paths'

export default class CancellationCreatePage extends Page {
  constructor() {
    super('Cancel this placement')
  }

  static visit(premisesId: string, bookingId: string): CancellationCreatePage {
    cy.visit(paths.bookings.cancellations.new({ premisesId, bookingId }))

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
