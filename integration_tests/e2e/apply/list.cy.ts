import { StartPage, ListPage } from '../../pages/apply'

import applicationSummaryFactory from '../../../server/testutils/factories/applicationSummary'
import Page from '../../pages/page'

context('Applications dashboard', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
  })

  it('shows the dashboard ', () => {
    // Given I am logged in
    cy.signIn()

    // And there are applications in the database
    const applicationSummaries = applicationSummaryFactory.buildList(5)
    cy.task('stubApplications', applicationSummaries)

    // When I visit the Previous Applications page
    const page = ListPage.visit()

    // Then I should see all of the application summaries listed
    page.shouldShowApplicationSummaries(applicationSummaries)

    // And I the button should take me to the application start page
    page.clickSubmit()

    Page.verifyOnPage(StartPage)
  })
})
