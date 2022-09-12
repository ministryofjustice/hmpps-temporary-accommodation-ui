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
}
