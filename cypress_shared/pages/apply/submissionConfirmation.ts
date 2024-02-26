import Page from '../page'

export default class SubmissionConfirmation extends Page {
  constructor() {
    super('Referral complete')
  }

  linkToFeedbackSurvey() {
    cy.contains('a', 'What did you think of this service?').should(
      'have.attr',
      'href',
      'https://forms.office.com/e/SsWLbpUgtx',
    )
  }

  clickBackToDashboard() {
    cy.contains('a', 'Back to dashboard').click()
  }
}
