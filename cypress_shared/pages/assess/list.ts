import {
  TemporaryAccommodationAssessment as Assessment,
  TemporaryAccommodationAssessmentSummary as AssessmentSummary,
} from '../../../server/@types/shared'
import paths from '../../../server/paths/temporary-accommodation/manage'
import { statusName } from '../../../server/utils/assessmentStatusUtils'
import { DateFormats } from '../../../server/utils/dateUtils'
import { isFullPerson, personName } from '../../../server/utils/personUtils'
import Page from '../page'
import type { AssessmentSearchApiStatus } from '../../../server/@types/ui'

export default class ListPage extends Page {
  constructor(pageTitle: string) {
    super(pageTitle)
  }

  static visit(status: AssessmentSearchApiStatus | 'archive'): ListPage {
    cy.visit(paths.assessments[status]())

    let pageTitle = 'Archived referrals'

    if (status === 'unallocated') {
      pageTitle = 'Unallocated referrals'
    } else if (status === 'in_review') {
      pageTitle = 'In review referrals'
    } else if (status === 'ready_to_place') {
      pageTitle = 'Ready to place referrals'
    }

    return new ListPage(pageTitle)
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

  checkCRNSearchValue(value: string, status: string) {
    this.shouldShowTextInputByLabel(`Search ${status} referrals by CRN (case reference number)`, value)
  }

  checkResults(assessments: AssessmentSummary[]) {
    cy.get('main table tbody tr').should('have.length', assessments.length)
    assessments.forEach(result => {
      cy.get('main table tbody').should('contain', result.person.crn)
    })
  }

  searchByCRN(crn: string, status: string) {
    this.completeTextInputByLabel(`Search ${status} referrals by CRN (case reference number)`, crn)
    this.clickSubmit('Search')
  }

  clearSearch() {
    cy.get('a').contains('Clear').click()
  }
}
