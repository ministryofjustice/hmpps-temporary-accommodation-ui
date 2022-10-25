import Page from '../page'

export default class PlacementPurposePage extends Page {
  constructor() {
    super('What is the purpose of the Approved Premises (AP) placement?')
  }

  completeForm() {
    this.checkCheckboxByNameAndValue('placementPurpose', 'drugAlcoholSupport')
    this.checkCheckboxByNameAndValue('placementPurpose', 'otherReason')
    this.getTextInputByIdAndEnterDetails('otherReason', 'Another reason')
  }
}
