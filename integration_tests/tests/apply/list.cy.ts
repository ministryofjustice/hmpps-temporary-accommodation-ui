import { ListPage, StartPage } from '../../../cypress_shared/pages/apply'

import Page from '../../../cypress_shared/pages/page'
import setupTestUser from '../../../cypress_shared/utils/setupTestUser'
import { applicationFactory } from '../../../server/testutils/factories'

context('Applications dashboard', () => {
  beforeEach(() => {
    cy.task('reset')
    setupTestUser()
  })

  it('shows the dashboard ', () => {
    // Given I am logged in
    cy.signIn()

    // And there are applications in the database
    const inProgressApplications = applicationFactory.withReleaseDate().buildList(5, { status: 'inProgress' })
    const submittedApplications = applicationFactory.withReleaseDate().buildList(5, { status: 'submitted' })
    const requestedFurtherInformationApplications = applicationFactory
      .withReleaseDate()
      .buildList(5, { status: 'requestedFurtherInformation' })

    cy.task(
      'stubApplications',
      [inProgressApplications, submittedApplications, requestedFurtherInformationApplications].flat(),
    )

    // When I visit the Previous Applications page
    const page = ListPage.visit(inProgressApplications, submittedApplications, requestedFurtherInformationApplications)

    // Then I should see all of the in progress applications
    page.shouldShowInProgressApplications()

    // And I click on the Further Information Requested tab
    page.clickFurtherInformationRequestedTab()

    // Then I should see the applications where further information has been requested
    page.shouldShowFurtherInformationRequestedApplications()

    // And I click on the submitted tab
    page.clickSubmittedTab()

    // Then I should see the applications that have been submitted
    page.shouldShowSubmittedApplications()

    // And I the button should take me to the application start page
    page.clickSubmit()

    Page.verifyOnPage(StartPage)
  })
})
