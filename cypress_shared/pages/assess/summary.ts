import { TemporaryAccommodationAssessment as Assessment } from '../../../server/@types/shared'
import paths from '../../../server/paths/temporary-accommodation/manage'
import { sentenceCase } from '../../../server/utils/utils'
import PersonDetailsComponent from '../../components/personDetails'
import Page from '../page'

export default class AssessmentSummaryPage extends Page {
  constructor(private readonly assessment: Assessment) {
    super(assessment.application.person.name)
    cy.get('.govuk-tag').contains(sentenceCase(assessment.status as string))
  }

  static visit(assessment: Assessment): AssessmentSummaryPage {
    cy.visit(paths.assessments.summary({ id: assessment.id }))

    return new AssessmentSummaryPage(assessment)
  }

  clickAction(option: string) {
    cy.get('.moj-button-menu__toggle-button').contains('Update referral status').click()
    cy.get('.moj-button-menu__wrapper').contains(option).click()
  }

  clickFullReferral() {
    cy.get('a').contains('View full referral').click()
  }

  shouldShowAssessmentSummary(assessment: Assessment) {
    const {
      application: { person },
    } = assessment
    const personDetailsComponent = new PersonDetailsComponent(person)

    cy.get('h1').contains(person.name)
    personDetailsComponent.shouldShowPersonDetails()
  }

  shouldShowNotesTimeline() {
    cy.get('.moj-timeline')
      .parent()
      .within(() => {
        cy.get('.govuk-heading-l').should('contain', 'Referral History')

        this.assessment
          .referralHistoryNotes!.sort((noteA, noteB) => {
            if (noteA.createdAt === noteB.createdAt) {
              return 0
            }

            return noteA.createdAt < noteB.createdAt ? 1 : -1
          })
          .forEach((note, index) => {
            note.message.split('\n').forEach(line => {
              cy.get('.moj-timeline__description').eq(index).contains(line)
            })
          })
      })
  }
}
