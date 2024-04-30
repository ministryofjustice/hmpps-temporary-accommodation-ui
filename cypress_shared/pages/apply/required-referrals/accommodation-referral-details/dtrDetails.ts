import type { TemporaryAccommodationApplication } from '@approved-premises/api'
import paths from '../../../../../server/paths/apply'
import ApplyPage from '../../applyPage'

export default class DtrDetailsPage extends ApplyPage {
  constructor(application: TemporaryAccommodationApplication) {
    super(
      'Enter details about the Duty to refer (England) or Application for Assistance (Wales)',
      application,
      'accommodation-referral-details',
      'dtr-details',
      paths.applications.pages.show({
        id: application.id,
        task: 'accommodation-referral-details',
        page: 'dtr-submitted',
      }),
    )
  }

  completeForm(localAuthorityName?: string) {
    this.completeDateInputsFromPageBody('date')
    this.completeTextInputFromPageBody('reference')
    this.getSelectInputByIdAndSelectAnEntry('localAuthorityAreaName', localAuthorityName || 'Barking and Dagenham')
    this.checkRadioButtonFromPageBody('dutyToReferOutcome')
  }
}
