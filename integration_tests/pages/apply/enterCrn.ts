import type { Person } from 'approved-premises'

import Page from '../page'

export default class EnterCRNPage extends Page {
  constructor() {
    super('Enter the individual’s CRN')
  }

  enterCrn(crn: string): void {
    this.getTextInputByIdAndEnterDetails('crn', crn)
  }

  public clickSubmit(): void {
    cy.get('button').click()
  }

  public shouldShowErrorMessage(person: Person): void {
    cy.get('.govuk-error-summary').should('contain', `No person with an CRN of '${person.crn}' was found`)
    cy.get(`[data-cy-error-crn]`).should('contain', `No person with an CRN of '${person.crn}' was found`)
  }
}
