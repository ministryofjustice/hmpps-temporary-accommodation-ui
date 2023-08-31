import { TemporaryAccommodationAssessment as Assessment } from '../../../server/@types/shared'
import paths from '../../../server/paths/temporary-accommodation/manage'
import type { Section } from '../../../server/utils/applicationUtils'
import { statusName } from '../../../server/utils/assessmentStatusUtils'
import { personName } from '../../../server/utils/personUtils'
import Page from '../page'

export default class AssessmentFullPage extends Page {
  constructor(private readonly assessment: Assessment) {
    super(personName(assessment.application.person, 'Limited access offender'))
    cy.get('.govuk-tag').contains(statusName(assessment.status))
  }

  static visit(assessment: Assessment): AssessmentFullPage {
    cy.visit(paths.assessments.full({ id: assessment.id }))

    return new AssessmentFullPage(assessment)
  }

  shouldShowAssessment(applicationTranslatedDocument: Record<'sections', Array<Section>>) {
    applicationTranslatedDocument.sections.forEach(section => {
      cy.get('h2').contains(section.title)

      section.tasks.forEach(task => {
        cy.get('.govuk-summary-card__title-wrapper')
          .contains(task.title)
          .parent()
          .next('div')
          .within(() => {
            task.content.forEach(content => {
              Object.entries(content).forEach(([key, value]) => {
                if (typeof value === 'string') {
                  value.split('\n').forEach(line => {
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
      })
    })
  }
}
