import type { Cancellation } from '@approved-premises/api'
import Page from '../page'
import paths from '../../../server/paths/manage'

export default class CancellationCreatePage extends Page {
  constructor() {
    super('Cancel this placement')
  }

  static visit(premisesId: string, bookingId: string): CancellationCreatePage {
    cy.visit(paths.bookings.cancellations.new({ premisesId, bookingId }))

    return new CancellationCreatePage()
  }

  completeForm(cancellation: Cancellation): void {
    this.getLegend('What date was this placement cancelled?')
    this.completeDateInputs('date', cancellation.date)

    this.getLegend('What is the reason for cancelling this placement?')
    this.checkRadioByNameAndValue('cancellation[reason]', cancellation.reason.id)

    this.getLabel('Additional notes')
    this.completeTextArea('cancellation[notes]', cancellation.notes)

    this.clickSubmit()
  }
}
