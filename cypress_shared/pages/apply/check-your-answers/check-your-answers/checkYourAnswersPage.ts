import type { TemporaryAccommodationApplication } from '@approved-premises/api'
import ApplyPage from '../../applyPage'

import paths from '../../../../../server/paths/apply'

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

  shouldShowContactDetailsAnswers(pages: Array<ApplyPage>) {
    this.shouldShowCheckYourAnswersTitle('contact-details', 'Contact details')
    this.shouldShowAnswersForTask('contact-details', pages)
  }

  shouldShowEligibilityAnswers(pages: Array<ApplyPage>) {
    this.shouldShowCheckYourAnswersTitle('eligibility', 'Eligibility')
    this.shouldShowAnswersForTask('eligibility', pages)
  }

  shouldShowOasysImportAnswers(pages: Array<ApplyPage>) {
    this.shouldShowCheckYourAnswersTitle('oasys-import', 'OASys information')
    this.shouldShowAnswersForTask('oasys-import', pages)
  }

  shouldShowSafeguardingAndSupportAnswers(pages: Array<ApplyPage>) {
    this.shouldShowCheckYourAnswersTitle('safeguarding-and-support', 'Safeguarding and support')
    this.shouldShowAnswersForTask('safeguarding-and-support', pages)
  }

  shouldShowRequirementsForPlacementAnswers(pages: Array<ApplyPage>) {
    this.shouldShowCheckYourAnswersTitle('requirements-for-placement', 'Requirements for placement')
    this.shouldShowAnswersForTask('requirements-for-placement', pages)
  }

  shouldShowMoveOnPlanAnswers(pages: Array<ApplyPage>) {
    this.shouldShowCheckYourAnswersTitle('move-on-plan', 'Move on plan')
    this.shouldShowAnswersForTask('move-on-plan', pages)
  }

  shouldShowAccommodationReferralDetails(pages: Array<ApplyPage>) {
    this.shouldShowCheckYourAnswersTitle('accommodation-referral-details', 'Accommodation referral details')
    this.shouldShowAnswersForTask('accommodation-referral-details', pages)
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