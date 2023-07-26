import {
  TemporaryAccommodationAssessment as Assessment,
  TemporaryAccommodationAssessmentSummary as AssessmentSummary,
} from '../../../server/@types/shared'
import paths from '../../../server/paths/temporary-accommodation/manage'
import { DateFormats } from '../../../server/utils/dateUtils'
import Page from '../page'

export default class ListPage extends Page {
  constructor(
    private readonly unallocatedAssessments: Array<AssessmentSummary>,
    private readonly inProgressAssessments: Array<AssessmentSummary>,
    private readonly readyToPlaceAssessments: Array<AssessmentSummary>,
  ) {
    super('Referrals')
  }

  clickAssessment(assessment: Assessment) {
    cy.get('a').contains(assessment.application.person.name).click()
  }

  shouldShowInProgressAssessments(): void {
    cy.get('#tab_in-review').click()
    this.shouldShowAssessments(this.inProgressAssessments, 'in-review')
  }

  shouldShowUnallocatedAssessments(): void {
    cy.get('#tab_unallocated').click()
    this.shouldShowAssessments(this.unallocatedAssessments, 'unallocated')
  }

  shouldShowReadyToPlaceAssessments(): void {
    cy.get('#tab_ready-to-place').click()
    this.shouldShowAssessments(this.readyToPlaceAssessments, 'ready-to-place')
  }

  private shouldShowAssessments(assessments: Array<AssessmentSummary>, containerId: string): void {
    assessments.forEach(assessmentSummary => {
      cy.get(`#${containerId}`).within(() => {
        cy.get(`a[href*="${paths.assessments.show({ id: assessmentSummary.id })}"]`)
          .parent()
          .parent()
          .within(() => {
            cy.get('th').eq(0).contains(assessmentSummary.person.name)
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
          })
      })
    })
  }
}
