import { TemporaryAccommodationApplication as Application } from '@approved-premises/api'
import paths from '../../../../../server/paths/apply'
import ApplyPage from '../../applyPage'

export default class ProbationPractitioner extends ApplyPage {
  private application: Application

  constructor(application: Application) {
    super(
      `Confirm probation practitioner details`,
      application,
      'contact-details',
      'probation-practitioner',
      paths.applications.show({ id: application.id }),
    )
    this.application = application
  }

  completeForm() {
    this.canSaveAndContinue(false)
    this.updateName()
    this.updateEmail()
    this.updatePhoneNumber()
    this.updatePDU()
    this.canSaveAndContinue(true)
    this.clickSubmit()
  }

  updateName() {
    this.clickLink(/(Change Name|Enter a name)/)
    this.completeTextInputByLabel('Full name', this.application.data['contact-details']['practitioner-name'].name)
    this.clickSubmit()
  }

  updateEmail() {
    this.clickLink(/(Change Email address|Enter an email address)/)
    this.completeTextInputByLabel('Email address', this.application.data['contact-details']['practitioner-email'].email)
    this.clickSubmit()
  }

  updatePhoneNumber() {
    this.clickLink(/(Change Phone number|Enter a phone number)/)
    this.completeTextInputByLabel('Phone number', this.application.data['contact-details']['practitioner-phone'].phone)
    this.clickSubmit()
  }

  updatePDU() {
    const pdu = this.application.data['contact-details']['practitioner-pdu'].name
    this.clickLink(/(Change PDU|Enter a PDU)/)
    // Type the first 3 letters of the PDU then click the option shown
    this.completeTextInputByLabel('PDU (probation delivery unit)', pdu.slice(0, 3))
    cy.get('li[role="option"]').contains(pdu).click()
    this.clickSubmit()
  }

  private canSaveAndContinue(buttonShown: boolean) {
    cy.contains('Save and continue').should(buttonShown ? 'exist' : 'not.exist')
  }
}
