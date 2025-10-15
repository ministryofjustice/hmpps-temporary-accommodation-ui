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
import { supportLink } from '../../../server/utils/phaseBannerUtils'
import { pathFromStatus } from '../../../server/utils/assessmentUtils'

export default class ListPage extends Page {
  constructor(pageTitle: string) {
    super(pageTitle)
  }

  static visit(status: AssessmentSearchApiStatus): ListPage {
    cy.visit(pathFromStatus(status))

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

  shouldShowAssessments(assessments: Array<AssessmentSummary>, checkStatus = false): void {
    assessments.forEach(assessmentSummary => {
      cy.get(`a[href*="${paths.assessments.full({ id: assessmentSummary.id })}"]`)
        .parent()
        .parent()
        .within(() => {
          cy.get('th')
            .eq(0)
            .contains(personName(assessmentSummary.person, 'Limited access offender'))
            .parent()
            .contains(assessmentSummary.person.crn)
          cy.get('td').eq(0).contains(assessmentSummary.probationDeliveryUnitName)
          cy.get('td').eq(1).contains(DateFormats.isoDateToUIDate(assessmentSummary.createdAt))
          cy.get('td')
            .eq(2)
            .contains(
              assessmentSummary?.arrivalDate ? DateFormats.isoDateToUIDate(assessmentSummary?.arrivalDate) : 'N/A',
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

  checkCrnOrNameSearchValue(value: string, status: string) {
    this.shouldShowTextInputByLabel(`Search ${status} referrals with the person’s name or CRN`, value)
  }

  checkResults(assessments: AssessmentSummary[]) {
    cy.get('main table tbody tr').should('have.length', assessments.length)
    assessments.forEach(result => {
      cy.get('main table tbody').should('contain', result.person.crn)
    })
  }

  searchByCrnOrName(crn: string, status: string) {
    this.completeTextInputByLabel(`Search ${status} referrals with the person’s name or CRN`, crn)
    this.clickSubmit('Search')
  }

  clearSearch() {
    cy.get('a').contains('Clear').click()
  }

  checkNoResultsByCRN(status: string, crn: string) {
    cy.get('main table').should('not.exist')
    cy.get('h2').should('contain', `There are no results for ‘${crn}’ in ${status} referrals.`)
    cy.get('p').should('contain', 'Check the other lists.')
    cy.get('main a').contains('contact support').should('have.attr', 'href', supportLink)
  }
}
