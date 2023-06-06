import type { TemporaryAccommodationApplication } from '@approved-premises/api'
import paths from '../../../server/paths/apply'
import ContactDetails from './contactDetails'

export default class CrsDetailsPage extends ContactDetails {
  constructor(application: TemporaryAccommodationApplication) {
    super(
      'CRS referrer details',
      application,
      'accommodation-referral-details',
      'crs-details',
      paths.applications.pages.show({
        id: application.id,
        task: 'accommodation-referral-details',
        page: 'crs-submitted',
      }),
    )
  }
}
