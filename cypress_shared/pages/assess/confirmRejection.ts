import Page from '../page'

export default class AssessmentRejectionConfirmPage extends Page {
  constructor(title: string) {
    super(title)
  }

  completeForm() {
    this.checkRadioByNameAndLabel('referralRejectionReasonId', 'Other (please add)')
    this.completeTextArea('referralRejectionReasonDetail', 'Details about the rejection reason')
    this.checkRadioByNameAndLabel('isWithdrawn', 'Yes')
  }
}
