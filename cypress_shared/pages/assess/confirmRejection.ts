import Page from '../page'
import { TemporaryAccommodationAssessment as Assessment } from '../../../server/@types/shared'
import { personName } from '../../../server/utils/personUtils'

export default class AssessmentRejectionConfirmPage extends Page {
  constructor(private readonly assessment: Assessment) {
    super(`Reject ${personName(assessment.application.person)}'s referral`)
  }

  completeForm() {
    this.getSelectInputByIdAndSelectAnEntry('referralRejectionReasonId', 'Remanded in custody or detained')
    cy.get('#referralRejectionReasonDetail-conditional').should('not.have.attr', 'hidden')
    this.completeTextArea('referralRejectionReasonDetail', 'Details about the rejection reason')
    this.checkRadioByNameAndLabel('ppRequestedWithdrawal', 'Yes')
  }

  clearRejectionReasonDetail() {
    this.clearTextInputByLabel('Add details about why the referral is being rejected')
  }
}
