import type { TasklistPage } from 'approved-premises'

export default class ConfirmDetails implements TasklistPage {
  name = 'confirm-details'

  title = `Confirm ${this.details().names}'s details`

  next() {
    return 'sentence-type'
  }

  previous() {
    return 'enter-crn'
  }

  // TODO: This should be populated in the CRN step and returned from the session,
  // once we have session handling in place.
  details() {
    return {
      names: 'Robert Brown',
      crn: 'DO16821',
      dateOfBirth: '03/10/1991',
      sex: 'Male',
      nationality: 'British',
      religion: 'Christian',
    }
  }
}
