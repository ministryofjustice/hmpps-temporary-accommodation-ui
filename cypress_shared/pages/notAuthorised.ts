import Page from './page'

export default class UnAuthorisedPage extends Page {
  constructor() {
    super('You do not have permission to complete this action')
  }

  shouldShowPotentialReasons() {
    this.shouldShowBulletPoints([
      'the CRN is not in your caseload',
      'referrals through the CAS3 service are not currently available in your region',
      'the home area on your NDelius account is incorrect',
      'you are attempting to view an unsubmitted application created by a different user',
    ])
  }
}
