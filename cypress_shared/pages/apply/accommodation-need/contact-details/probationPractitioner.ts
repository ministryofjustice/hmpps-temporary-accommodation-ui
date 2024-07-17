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
    this.updateName()
    this.updateEmail()
    this.addPhoneNumber()
    this.clickSubmit()
  }

  updateName() {
    this.clickLink('Change name')
    this.completeTextInputByLabel('Full name', this.application.data['contact-details']['practitioner-name'].name)
    this.clickSubmit()
  }

  updateEmail() {
    this.clickLink('Change email address')
    this.completeTextInputByLabel('Email address', this.application.data['contact-details']['practitioner-email'].email)
    this.clickSubmit()
  }

  addPhoneNumber() {
    this.clickLink('Enter a phone number')
    this.completeTextInputByLabel('Phone number', this.application.data['contact-details']['practitioner-phone'].phone)
    this.clickSubmit()
  }
}
