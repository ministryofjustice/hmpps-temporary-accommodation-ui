import type { ApplicationSummary } from 'approved-premises'
import Page from '../page'
import paths from '../../../server/paths/apply'
import { DateFormats } from '../../../server/utils/dateUtils'

export default class ListPage extends Page {
  constructor() {
    super('Previous applications dashboard')
  }

  static visit(): ListPage {
    cy.visit(paths.applications.index.pattern)

    return new ListPage()
  }

  shouldShowApplicationSummaries(applicationSummaries: Array<ApplicationSummary>): void {
    applicationSummaries.forEach(summary => {
      cy.contains(summary.person.name)
        .should('have.attr', 'href', paths.applications.show({ id: summary.id }))
        .parent()
        .parent()
        .within(() => {
          cy.get('td').eq(0).contains(summary.person.crn)
          cy.get('td').eq(1).contains(summary.tier.level)
          cy.get('td').eq(2).contains(DateFormats.isoDateToUIDate(summary.arrivalDate))
          cy.get('td').eq(3).contains(summary.status)
        })
    })
  }

  clickSubmit() {
    cy.get('.govuk-button').click()
  }
}
