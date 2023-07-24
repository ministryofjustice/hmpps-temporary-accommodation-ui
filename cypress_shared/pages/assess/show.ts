import { TemporaryAccommodationAssessment as Assessment } from '../../../server/@types/shared'
import { sentenceCase } from '../../../server/utils/utils'
import Page from '../page'

export default class AssessmentShowPage extends Page {
  constructor(name: string, status: Assessment['status']) {
    super(name)
    cy.get('.govuk-tag').contains(sentenceCase(status as string))
  }
}
