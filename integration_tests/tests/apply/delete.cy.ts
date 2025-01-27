import { ListPage, TaskListPage } from '../../../cypress_shared/pages/apply'
import { setupTestUser } from '../../../cypress_shared/utils/setupTestUser'
import { applicationFactory } from '../../../server/testutils/factories'
import Page from '../../../cypress_shared/pages/page'
import DeletePage from '../../../cypress_shared/pages/apply/deletePage'

context('Delete application', () => {
  let firstApplication

  beforeEach(() => {
    cy.task('reset')
    setupTestUser('referrer')

    const inProgressApplications = applicationFactory.buildList(1, { status: 'inProgress' })
    ;[firstApplication] = inProgressApplications

    cy.task('stubApplications', inProgressApplications)
    cy.task('stubApplicationGet', { application: firstApplication })
    cy.task('stubApplicationDelete', { application: firstApplication })

    cy.signIn()
  })

  it('Referrer has the option to delete an in-progress application', () => {
    // When I visit the application show page
    const page = TaskListPage.visit(firstApplication)

    // Then I should see the delete option
    page.shouldShowDeleteOption()
  })

  it('Takes the user back to the list applications page after deleting', () => {
    const page = DeletePage.visit(firstApplication)
    DeletePage.verifyOnPage(DeletePage, firstApplication)
    page.hasGuidance()

    // Choose to delete application
    page.chooseYesOption()
    page.clickSubmit('Save and continue')

    // Then the user should be redirected to the list applications page
    const listPage = Page.verifyOnPage(ListPage, [firstApplication], [])

    // And I should see a success message
    listPage.shouldShowBanner(`You have deleted the referral`)
  })

  it('Takes the user back to the application task list after choosing not to delete', () => {
    const page = DeletePage.visit(firstApplication)
    DeletePage.verifyOnPage(DeletePage, firstApplication)
    page.hasGuidance()

    // Choose not to delete the application
    page.chooseNoOption()
    page.clickSubmit('Save and continue')

    // Then the user should return to the task list page
    Page.verifyOnPage(TaskListPage, firstApplication)
  })
})
