import {
  TemporaryAccommodationAssessment as Assessment,
  TemporaryAccommodationAssessmentSummary as AssessmentSummary,
} from '../../../server/@types/shared'
import paths from '../../../server/paths/temporary-accommodation/manage'
import { statusName } from '../../../server/utils/assessmentStatusUtils'
import { DateFormats } from '../../../server/utils/dateUtils'
import { isFullPerson, personName } from '../../../server/utils/personUtils'
import Page from '../page'

export default class ListPage extends Page {
  constructor(pageTitle: string) {
    super(pageTitle)
  }

  clickAssessment(assessment: Assessment) {
    if (isFullPerson(assessment.application.person)) {
      cy.get('a').contains(assessment.application.person.name).click()
    } else {
      cy.get(`a[href*="${paths.assessments.summary({ id: assessment.id })}"]`).click()
    }
  }

  clickViewArchivedReferrals(): void {
    cy.get('a').contains('View archived referrals').click()
  }

  shouldShowAssessments(assessments: Array<AssessmentSummary>, checkStatus = false): void {
    assessments.forEach(assessmentSummary => {
      cy.get(`a[href*="${paths.assessments.full({ id: assessmentSummary.id })}"]`)
        .parent()
        .parent()
        .within(() => {
          cy.get('th').eq(0).contains(personName(assessmentSummary.person, 'Limited access offender'))
          cy.get('td').eq(0).contains(assessmentSummary.person.crn)
          cy.get('td')
            .eq(1)
            .contains(
              DateFormats.isoDateToUIDate(assessmentSummary.createdAt, {
                format: 'short',
              }),
            )
          cy.get('td')
            .eq(2)
            .contains(
              assessmentSummary?.arrivalDate
                ? DateFormats.isoDateToUIDate(assessmentSummary?.arrivalDate, {
                    format: 'short',
                  })
                : 'N/A',
            )
          if (checkStatus) {
            cy.get('td').eq(3).contains(statusName(assessmentSummary.status))
          }
        })
    })
  }

  clickSubNav(label: string) {
    cy.get('[aria-label="Secondary navigation"] a').contains(label).click()
  }

  shouldHaveActiveSubNavItem(label: string) {
    cy.get('[aria-label="Secondary navigation"] a').contains(label).should('have.attr', 'aria-current', 'page')
  }

  clickPageLink(number: number) {
    cy.get('main nav[aria-label="Pagination navigation"] a').contains(number.toString()).click()
  }

  checkUrl(queryString: string) {
    cy.url({ timeout: 10000 }).should('include', queryString)
  }
}
