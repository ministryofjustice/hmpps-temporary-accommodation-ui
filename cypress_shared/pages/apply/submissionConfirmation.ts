import Page from '../page'

export default class SubmissionConfirmation extends Page {
  constructor() {
    super('Referral complete')
  }

  clickBackToDashboard() {
    cy.contains('a', 'Back to dashboard').click()
  }
}
