import type { AssessmentSummary } from '@approved-premises/api'
import { Assessment, Person } from '../../../../server/@types/shared'
import { PlaceContext } from '../../../../server/@types/ui'
import { assessmentSummaryFactory } from '../../../../server/testutils/factories'
import { DateFormats } from '../../../../server/utils/dateUtils'
import { isFullPerson } from '../../../../server/utils/personUtils'
import Page from '../../page'

export default class BookingSelectAssessmentPage extends Page {
  constructor(private readonly assessmentSummaries: Array<AssessmentSummary>) {
    super(assessmentSummaries.length ? 'Confirm which referral this booking is for' : 'Book without linking a referral')
  }

  static assignAssessmentSummaries(alias: string): void {
    cy.get('h1').then(titleElement => {
      if (Cypress.$(titleElement).text() === 'Book without linking a referral') {
        cy.wrap([]).as(alias)
      } else {
        cy.get('.govuk-radios')
          .children('.govuk-radios__item')
          .then(elements => {
            const assessmentSummaries = elements.toArray().map(element =>
              assessmentSummaryFactory.build({
                id: Cypress.$(element).children('input').attr('value'),
                status: 'ready_to_place',
              }),
            )
            cy.wrap(assessmentSummaries.slice(0, -1)).as(alias)
          })
      }
    })
  }

  shouldDisplayAssessments(): void {
    this.assessmentSummaries.forEach((assessmentSummary: AssessmentSummary) => {
      cy.get(`input[name="assessmentId"][value="${assessmentSummary.id}"]`)
        .siblings('label')
        .eq(0)
        .contains(DateFormats.isoDateToUIDate(assessmentSummary.createdAt, { format: 'short' }))
    })
  }

  shouldShowPreselectedAsssessmentFromPlaceContext(placeContext: NonNullable<PlaceContext>): void {
    this.shouldShowRadioInput(
      'assessmentId',
      this.assessmentRadioText(placeContext.assessment, placeContext.assessment.application.person),
    )
  }

  selectAssessment(assessmentSummary: AssessmentSummary): void {
    this.checkRadioByNameAndLabel('assessmentId', this.assessmentRadioText(assessmentSummary, assessmentSummary.person))
  }

  selectNoAssessment(): void {
    this.checkRadioByNameAndLabel('assessmentId', 'Book this bedspace without linking a referral')
  }

  private assessmentRadioText(assessment: Assessment | AssessmentSummary, person: Person): string {
    if (isFullPerson(person)) {
      return `${person.name}, CRN ${person.crn}, referral submitted ${DateFormats.isoDateToUIDate(
        assessment.createdAt,
        {
          format: 'short',
        },
      )}`
    }
    return `CRN ${person.crn}, referral submitted ${DateFormats.isoDateToUIDate(assessment.createdAt, {
      format: 'short',
    })}`
  }
}
