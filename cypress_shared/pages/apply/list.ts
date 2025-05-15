import { TemporaryAccommodationApplication as Application } from '../../../server/@types/shared'
import paths from '../../../server/paths/apply'
import { DateFormats } from '../../../server/utils/dateUtils'
import { isFullPerson, personName } from '../../../server/utils/personUtils'
import Page from '../page'

export default class ListPage extends Page {
  constructor(
    private readonly inProgressApplications: Array<Application>,
    private readonly submittedApplications: Array<Application>,
  ) {
    super('Transitional Accommodation (CAS3) referrals')
  }

  static visit(inProgressApplications: Array<Application>, submittedApplications: Array<Application>): ListPage {
    cy.visit(paths.applications.index.pattern)

    return new ListPage(inProgressApplications, submittedApplications)
  }

  clickApplication(application: Application) {
    if (isFullPerson(application.person)) {
      cy.get('a').contains(application.person.name).click()
    } else {
      cy.get(`a[href*="${paths.applications.show({ id: application.id })}"]`).click()
    }
  }

  clickSubmittedApplication(application: Application) {
    cy.get('#applications-submitted').within(() => {
      if (isFullPerson(application.person)) {
        cy.get('a').contains(application.person.name).click()
      } else {
        cy.get(`a[href*="${paths.applications.full({ id: application.id })}"]`).click()
      }
    })
  }

  shouldShowInProgressApplications(): void {
    this.shouldShowApplications(this.inProgressApplications, 'in-progress')
  }

  shouldShowSubmittedApplications(): void {
    this.shouldShowApplications(this.submittedApplications, 'applications-submitted')
  }

  shouldShowInProgressApplication(application: Application): void {
    cy.get('#in-progress').within(() => {
      cy.get(`a[href*="${paths.applications.show({ id: application.id })}"]`)
        .parent()
        .parent()
        .within(() => {
          cy.get('th').eq(0).contains(personName(application.person, 'Limited access offender'))
          cy.get('td').eq(0).contains(application.person.crn)
          cy.get('td').eq(1).contains('In Progress')
        })
    })
  }

  shouldShowSubmittedApplication(application: Application, checkSubmittedAtDate = true): void {
    cy.get('#applications-submitted').within(() => {
      cy.get(`a[href*="${paths.applications.full({ id: application.id })}"]`)
        .parent()
        .parent()
        .within(() => {
          cy.get('th').eq(0).contains(personName(application.person, 'Limited access offender'))
          cy.get('td').eq(0).contains(application.person.crn)
          cy.get('td').eq(2).contains('Submitted')

          if (checkSubmittedAtDate) {
            cy.get('td').eq(1).contains(DateFormats.isoDateToUIDate(application.submittedAt))
          }
        })
    })
  }

  clickSubmit() {
    cy.get('.govuk-button').click()
  }

  clickSubmittedTab() {
    cy.get('a').contains('Submitted').click()
  }

  private shouldShowApplications(applications: Array<Application>, containerId: string): void {
    cy.get(`#${containerId}`).find('tbody>tr').should('have.length', applications.length)

    applications.forEach(application => {
      if (application.status === 'submitted') {
        this.shouldShowSubmittedApplication(application)
      } else {
        this.shouldShowInProgressApplication(application)
      }
    })
  }
}
