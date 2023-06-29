import Page from '../page'

export default class TaskListPage extends Page {
  constructor() {
    super('Make a referral for Temporary Accommodation')
  }

  shouldShowTaskStatus = (task: string, status: string): void => {
    cy.get(`#${task}-status`).should('contain', status)
  }

  clickTask(task: string): void {
    cy.get(`[data-cy-task-name="${task}"]`).click()
  }
}
