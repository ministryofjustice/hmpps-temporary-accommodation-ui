import { TemporaryAccommodationApplication as Application } from '../../../server/@types/shared'
import paths from '../../../server/paths/apply'
import { DateFormats } from '../../../server/utils/dateUtils'
import Page from '../page'

export default class ListPage extends Page {
  constructor(private readonly inProgressApplications: Array<Application>) {
    super('Temporary Accommodation (TA) referrals')
  }

  static visit(inProgressApplications: Array<Application>): ListPage {
    cy.visit(paths.applications.index.pattern)

    return new ListPage(inProgressApplications)
  }

  clickApplication(application: Application) {
    cy.get('a').contains(application.person.name).click()
  }

  shouldShowInProgressApplications(): void {
    this.shouldShowApplications(this.inProgressApplications, 'in-progress', 'In Progress')
  }

  clickSubmit() {
    cy.get('.govuk-button').click()
  }

  private shouldShowApplications(applications: Array<Application>, containerId: string, status: string): void {
    cy.get(`#${containerId}`).find('tbody>tr').should('have.length', applications.length)

    applications.forEach(application => {
      const releaseDate = application.data['basic-information']?.['release-date']?.releaseDate

      cy.get(`#${containerId}`).within(() => {
        cy.get(`a[href*="${paths.applications.show({ id: application.id })}"]`)
          .parent()
          .parent()
          .within(() => {
            cy.get('th').eq(0).contains(application.person.name)
            cy.get('td').eq(0).contains(application.person.crn)
            cy.get('td')
              .eq(1)
              .contains(
                releaseDate
                  ? DateFormats.isoDateToUIDate(releaseDate, {
                      format: 'short',
                    })
                  : 'N/A',
              )
            cy.get('td').eq(2).contains(status)
          })
      })
    })
  }
}
