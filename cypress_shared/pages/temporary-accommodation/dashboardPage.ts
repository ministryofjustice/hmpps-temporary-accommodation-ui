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

  clickReportsLink(): void {
    cy.get('a').contains('Download data').click()
  }

  clickSearchBedspacesLink(): void {
    cy.get('a').contains('Find a bedspace').click()
  }

  clickViewBookingsLink(): void {
    cy.get('a').contains('View all bookings').click()
  }

  clickReviewAndAssessReferrals(): void {
    cy.get('a').contains('Review and assess referrals').click()
  }
}
