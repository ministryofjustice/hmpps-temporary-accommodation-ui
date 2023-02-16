import Page from '../page'

export default class TaskListPage extends Page {
  constructor() {
    super('Apply for an Approved Premises (AP) placement')
  }

  shouldShowTaskStatus = (task: string, status: string): void => {
    cy.get(`#${task}-status`).should('contain', status)
  }
}
