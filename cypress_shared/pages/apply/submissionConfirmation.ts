import Page from '../page'

export default class SubmissionConfirmation extends Page {
  constructor() {
    super('Application confirmation')
  }

  clickBackToDashboard() {
    cy.contains('a', 'Back to dashboard').click()
  }
}
