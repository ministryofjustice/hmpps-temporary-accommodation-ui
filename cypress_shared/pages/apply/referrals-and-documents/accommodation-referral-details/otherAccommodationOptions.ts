import type { TemporaryAccommodationApplication } from '@approved-premises/api'
import paths from '../../../../../server/paths/apply'
import ApplyPage from '../../applyPage'

export default class OtherAccommodationOptionsPage extends ApplyPage {
  constructor(application: TemporaryAccommodationApplication) {
    super(
      'Have other accommodation options been considered?',
      application,
      'accommodation-referral-details',
      'other-accommodation-options',
      paths.applications.pages.show({
        id: application.id,
        task: 'accommodation-referral-details',
        page: 'crs-submitted',
      }),
    )
  }

  completeForm() {
    this.completeYesNoInputWithDetailFromPageBody('otherOptions')
  }
}
