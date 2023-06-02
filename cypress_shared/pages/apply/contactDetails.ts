import ApplyPage from './applyPage'

export default abstract class ContactDetails extends ApplyPage {
  completeForm() {
    this.completeTextInputFromPageBody('name')
    this.completeTextInputFromPageBody('phone')
    this.completeTextInputFromPageBody('email')
  }
}
