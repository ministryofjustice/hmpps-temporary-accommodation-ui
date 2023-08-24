import type { AssessmentSummary } from '@approved-premises/api'
import { assessmentSummaryFactory } from '../../../../server/testutils/factories'
import { noAssessmentId } from '../../../../server/utils/bookingUtils'
import { DateFormats } from '../../../../server/utils/dateUtils'
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

  selectAssessment(assessmentSummary: AssessmentSummary): void {
    this.checkRadioByNameAndValue('assessmentId', assessmentSummary.id)
  }

  selectNoAssessment(): void {
    this.checkRadioByNameAndValue('assessmentId', noAssessmentId)
  }
}
