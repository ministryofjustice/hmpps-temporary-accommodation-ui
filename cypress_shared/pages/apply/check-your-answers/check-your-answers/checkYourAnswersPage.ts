import type { TemporaryAccommodationApplication } from '@approved-premises/api'
import ApplyPage from '../../applyPage'

import paths from '../../../../../server/paths/apply'
import PersonDetailsComponent from '../../../../components/personDetails'

export default class CheckYourAnswersPage extends ApplyPage {
  private readonly personDetailsComponent: PersonDetailsComponent

  constructor(application: TemporaryAccommodationApplication) {
    super(
      'Check your answers',
      application,
      'check-your-answers',
      'review',
      paths.applications.show({ id: application.id }),
    )

    this.personDetailsComponent = new PersonDetailsComponent(application.person)
  }

  shouldShowPersonDetails() {
    this.personDetailsComponent.shouldShowPersonDetails()
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

  shouldShowBehaviourInPreviousAccommodationAnswers(pages: Array<ApplyPage>) {
    this.shouldShowCheckYourAnswersTitle('behaviour-in-previous-accommodation', 'Behaviour in previous accommodation')
    this.shouldShowAnswersForTask('behaviour-in-previous-accommodation', pages)
  }

  shouldShowConsentAnswers(pages: Array<ApplyPage>) {
    this.shouldShowCheckYourAnswersTitle('consent', 'Consent')
    this.shouldShowAnswersForTask('consent', pages)
  }

  shouldShowLicenceConditionsAnswers(pages: Array<ApplyPage>) {
    this.shouldShowCheckYourAnswersTitle('licence-conditions', 'Licence conditions')
    this.shouldShowAnswersForTask('licence-conditions', pages)
  }

  shouldShowOasysImportAnswers(pages: Array<ApplyPage>) {
    this.shouldShowCheckYourAnswersTitle('oasys-import', 'OASys information')
    this.shouldShowAnswersForTask('oasys-import', pages)
  }

  shouldShowPlacementLocationAnswers(pages: Array<ApplyPage>) {
    this.shouldShowCheckYourAnswersTitle('placement-location', 'Placement location')
    this.shouldShowAnswersForTask('placement-location', pages)
  }

  shouldShowDisabilityCulturalAndSpecificNeedsAnswers(pages: Array<ApplyPage>) {
    this.shouldShowCheckYourAnswersTitle(
      'disability-cultural-and-specific-needs',
      'Disability, cultural and specific needs',
    )
    this.shouldShowAnswersForTask('disability-cultural-and-specific-needs', pages)
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

  private shouldShowAnswersForTask(taskName: string, pages: Array<ApplyPage>) {
    cy.get(`[data-cy-check-your-answers-section="${taskName}"]`).within(() => {
      pages.forEach(page => {
        const responses = page.tasklistPage.response()
        Object.keys(responses).forEach(key => {
          const value = responses[key] as string | Array<Record<string, unknown>>

          if (typeof value === 'string') {
            ;(responses[key] as string).split('\n').forEach(line => {
              this.assertDefinition(key, line)
            })
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
