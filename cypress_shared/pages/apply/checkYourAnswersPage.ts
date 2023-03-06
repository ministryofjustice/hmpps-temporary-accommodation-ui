import type { ApprovedPremisesApplication } from '@approved-premises/api'
import ApplyPage from './applyPage'

import paths from '../../../server/paths/apply'

export default class CheckYourAnswersPage extends ApplyPage {
  constructor(application: ApprovedPremisesApplication) {
    super(
      'Check your answers',
      application,
      'check-your-answers',
      'review',
      paths.applications.show({ id: application.id }),
    )
  }

  shouldShowBasicInformationAnswers(pages: Array<ApplyPage>) {
    this.shouldShowCheckYourAnswersTitle('basic-information', 'Basic information')
    this.shouldShowAnswersForTask('basic-information', pages)
  }

  private shouldShowAnswersForTask(taskName: string, pages: Array<ApplyPage>) {
    cy.get(`[data-cy-check-your-answers-section="${taskName}"]`).within(() => {
      pages.forEach(page => {
        const responses = page.tasklistPage.response()
        Object.keys(responses).forEach(key => {
          this.assertDefinition(key, responses[key] as string)
        })
      })
    })
  }
}
