import { TemporaryAccommodationApplication as Application } from '../../../server/@types/shared'
import Page from '../page'
import paths from '../../../server/paths/apply'

export default class TaskListPage extends Page {
  constructor(private readonly inProgressApplication: Application) {
    super('Make a referral for Transitional Accommodation (CAS3)')
  }

  static visit(inProgressApplication: Application): TaskListPage {
    cy.visit(paths.applications.show({ id: inProgressApplication.id }))

    return new TaskListPage(inProgressApplication)
  }

  shouldShowTaskStatus(task: string, status: string): void {
    cy.get(`#${task}-status`).should('contain', status)
  }

  shouldNotShowSubmitComponents(): void {
    cy.get('input[value="submit"]').should('not.exist')
    cy.get('button').should('not.exist')
  }

  shouldShowDeleteOption(): void {
    cy.get('a').contains('Delete referral');
  }

  clickTask(task: string): void {
    cy.get(`[data-cy-task-name="${task}"]`).click()
  }
}
