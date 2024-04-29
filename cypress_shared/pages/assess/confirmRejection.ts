import Page from '../page'

export default class AssessmentRejectionConfirmPage extends Page {
  constructor(title: string) {
    super(title)
  }

  completeForm() {
    this.checkRadioByNameAndLabel('referralRejectionReason', 'There was not enough time to place them')
  }
}
