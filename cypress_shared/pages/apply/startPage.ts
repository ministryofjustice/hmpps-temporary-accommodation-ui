import Page from '../page'

import paths from '../../../server/paths/apply'

export default class StartPage extends Page {
  constructor() {
    super('Make a referral for Transitional Accommodation')
  }

  static visit(): StartPage {
    cy.visit(paths.applications.start({}))
    return new StartPage()
  }

  startApplication(): void {
    cy.get('button').contains('Start now').click()
  }
}
