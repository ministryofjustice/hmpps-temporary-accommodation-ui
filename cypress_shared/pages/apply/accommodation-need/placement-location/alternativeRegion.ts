import type { TemporaryAccommodationApplication } from '@approved-premises/api'
import paths from '../../../../../server/paths/apply'
import ApplyPage from '../../applyPage'

export default class AlternativeRegionPage extends ApplyPage {
  constructor(application: TemporaryAccommodationApplication) {
    super(
      `Is the placement for the ${application.data['placement-location']['alternative-region'].regionName} region?`,
      application,
      'placement-location',
      'alternative-region',
      paths.applications.show({
        id: application.id,
      }),
    )
  }

  completeForm() {
    this.checkRadioButtonFromPageBody('alternativeRegion')
  }
}
