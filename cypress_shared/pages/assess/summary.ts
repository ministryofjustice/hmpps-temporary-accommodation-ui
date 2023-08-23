import { TemporaryAccommodationAssessment as Assessment } from '../../../server/@types/shared'
import { sentenceCase } from '../../../server/utils/utils'
import PersonDetailsComponent from '../../components/personDetails'
import Page from '../page'

export default class AssessmentSummaryPage extends Page {
  constructor(name: string, status: Assessment['status']) {
    super(name)
    cy.get('.govuk-tag').contains(sentenceCase(status as string))
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
}
