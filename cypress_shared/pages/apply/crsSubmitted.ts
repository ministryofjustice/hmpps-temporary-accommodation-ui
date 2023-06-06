import type { TemporaryAccommodationApplication } from '@approved-premises/api'
import { hasSubmittedDtr } from '../../../server/form-pages/utils'
import paths from '../../../server/paths/apply'
import ApplyPage from './applyPage'

export default class CrsSubmittedPage extends ApplyPage {
  constructor(application: TemporaryAccommodationApplication) {
    super(
      'Has a referral to Commissioned Rehabilitative Services (CRS) been submitted?',
      application,
      'accommodation-referral-details',
      'crs-submitted',
      paths.applications.pages.show({
        id: application.id,
        task: 'accommodation-referral-details',
        page: hasSubmittedDtr(application) ? 'dtr-details' : 'dtr-submitted',
      }),
    )
  }

  completeForm() {
    this.checkRadioButtonFromPageBody('crsSubmitted')
  }
}
