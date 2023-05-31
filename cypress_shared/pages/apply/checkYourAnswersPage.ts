import type { TemporaryAccommodationApplication } from '@approved-premises/api'
import ApplyPage from './applyPage'

import paths from '../../../server/paths/apply'

export default class CheckYourAnswersPage extends ApplyPage {
  constructor(application: TemporaryAccommodationApplication) {
    super(
      'Check your answers',
      application,
      'check-your-answers',
      'review',
      paths.applications.show({ id: application.id }),
    )
  }

  shouldShowSentenceInformationAnswers(pages: Array<ApplyPage>) {
    this.shouldShowCheckYourAnswersTitle('sentence-information', 'Sentence information')
    this.shouldShowAnswersForTask('sentence-information', pages)
  }

  shouldShowOasysImportAnswers(pages: Array<ApplyPage>) {
    this.shouldShowCheckYourAnswersTitle('oasys-import', 'OASys information')
    this.shouldShowAnswersForTask('oasys-import', pages)
  }

  shouldShowAttachDocumentsAnswers(pages: Array<ApplyPage>) {
    this.shouldShowCheckYourAnswersTitle('attach-documents', 'Attach documents')
    this.shouldShowAnswersForTask('attach-documents', pages)
  }

  private shouldShowAnswersForTask(taskName: string, pages: Array<ApplyPage>) {
    cy.get(`[data-cy-check-your-answers-section="${taskName}"]`).within(() => {
      pages.forEach(page => {
        const responses = page.tasklistPage.response()
        Object.keys(responses).forEach(key => {
          const value = responses[key] as string | Array<Record<string, unknown>>

          if (typeof value === 'string') {
            this.assertDefinition(key, responses[key] as string)
          } else {
            cy.get('dt')
              .contains(key)
              .parent()
              .within(() => {
                value.forEach((embeddedRecord, index) => {
                  cy.get('dl.govuk-summary-list--embedded')
                    .eq(index)
                    .within(() => {
                      Object.keys(embeddedRecord).forEach(embeddedKey => {
                        this.assertDefinition(embeddedKey, embeddedRecord[embeddedKey] as string)
                      })
                    })
                })
              })
          }
        })
      })
    })
  }
}
