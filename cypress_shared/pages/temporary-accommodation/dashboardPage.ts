import Page from '../page'

export default class DashboardPage extends Page {
  constructor() {
    super('Manage estate')
  }

  static visit(): DashboardPage {
    cy.visit('/')
    return new DashboardPage()
  }

  clickPremisesLink(): void {
    cy.get('a').contains('Manage properties, bedspaces, and bookings').click()
  }
}
