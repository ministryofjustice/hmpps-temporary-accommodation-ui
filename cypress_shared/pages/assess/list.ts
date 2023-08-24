import {
  TemporaryAccommodationAssessment as Assessment,
  TemporaryAccommodationAssessmentSummary as AssessmentSummary,
} from '../../../server/@types/shared'
import paths from '../../../server/paths/temporary-accommodation/manage'
import { DateFormats } from '../../../server/utils/dateUtils'
import { isFullPerson, personName } from '../../../server/utils/personUtils'
import { sentenceCase } from '../../../server/utils/utils'
import Page from '../page'

export default class ListPage extends Page {
  constructor(
    private readonly unallocatedAssessments: Array<AssessmentSummary>,
    private readonly inProgressAssessments: Array<AssessmentSummary>,
    private readonly readyToPlaceAssessments: Array<AssessmentSummary>,
    private readonly archivedAssessments: Array<AssessmentSummary>,
  ) {
    super('Referrals')
  }

  clickAssessment(assessment: Assessment) {
    if (isFullPerson(assessment.application.person)) {
      cy.get('a').contains(assessment.application.person.name).click()
    } else {
      cy.get(`a[href*="${paths.assessments.summary({ id: assessment.id })}"]`).click()
    }
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

  clickViewArchivedReferrals(): void {
    cy.get('a').contains('View archived referrals').click()
  }

  shouldShowArchivedAssessments(): void {
    this.archivedAssessments.forEach(assessmentSummary => {
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
          cy.get('td')
            .eq(2)
            .contains(
              assessmentSummary?.arrivalDate
                ? DateFormats.isoDateToUIDate(assessmentSummary?.arrivalDate, {
                    format: 'short',
                  })
                : 'N/A',
            )
          cy.get('td').eq(3).contains(sentenceCase(assessmentSummary.status))
        })
    })
  }

  private shouldShowAssessments(assessments: Array<AssessmentSummary>, containerId: string): void {
    assessments.forEach(assessmentSummary => {
      cy.get(`#${containerId}`).within(() => {
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
          })
      })
    })
  }
}
