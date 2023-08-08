import { TemporaryAccommodationAssessment as Assessment } from '../../../server/@types/shared'
import { sentenceCase } from '../../../server/utils/utils'
import type { Section } from '../../../server/utils/applicationUtils'
import Page from '../page'

export default class AssessmentShowPage extends Page {
  constructor(name: string, status: Assessment['status']) {
    super(name)
    cy.get('.govuk-tag').contains(sentenceCase(status as string))
  }

  clickAction(option: string) {
    cy.get('.moj-button-menu__toggle-button').contains('Update referral status').click()
    cy.get('.moj-button-menu__wrapper').contains(option).click()
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
