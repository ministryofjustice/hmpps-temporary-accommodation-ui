import type { TemporaryAccommodationApplication } from '@approved-premises/api'
import paths from '../../../../../server/paths/apply'
import ApplyPage from '../../applyPage'

export default class PropertySharingPage extends ApplyPage {
  constructor(application: TemporaryAccommodationApplication) {
    super(
      'Requirements for placement',
      application,
      'requirements-for-placement',
      'property-sharing',
      paths.applications.show({
        id: application.id,
      }),
    )
  }

  completeForm() {
    this.completeYesNoInputWithDetailFromPageBody('propertySharing')
  }
}
