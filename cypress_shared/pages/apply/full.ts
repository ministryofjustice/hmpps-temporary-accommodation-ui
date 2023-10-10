import { TemporaryAccommodationApplication as Application } from '../../../server/@types/shared'
import paths from '../../../server/paths/apply'
import type { Section } from '../../../server/utils/applicationUtils'
import { personName } from '../../../server/utils/personUtils'
import Page from '../page'

export default class ApplicationFullPage extends Page {
  constructor(private readonly application: Application) {
    super(personName(application.person, 'Limited access offender'))
  }

  static visit(application: Application): ApplicationFullPage {
    cy.visit(paths.applications.full({ id: application.id }))

    return new ApplicationFullPage(application)
  }

  shouldShowApplication(applicationTranslatedDocument: Record<'sections', Array<Section>>) {
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
