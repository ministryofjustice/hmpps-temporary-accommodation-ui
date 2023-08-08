import { TemporaryAccommodationAssessment as Assessment } from '../../../../server/@types/shared'
import Page from '../../page'

export default class ListPage extends Page {
  constructor() {
    super('Referrals')
  }

  clickAssessment(assessment: Assessment) {
    cy.get('a').contains(assessment.application.person.name).click()
  }
}
