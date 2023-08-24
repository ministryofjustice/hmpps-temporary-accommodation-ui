import type { TemporaryAccommodationApplication } from '@approved-premises/api'
import paths from '../../../../../server/paths/apply'
import ApplyPage from '../../applyPage'
import { personName } from '../../../../../server/utils/personUtils'

export default class ReligiousOrCulturalNeedsPage extends ApplyPage {
  constructor(application: TemporaryAccommodationApplication) {
    super(
      `Does ${personName(application.person)} have any religious or cultural needs?`,
      application,
      'disability-cultural-and-specific-needs',
      'religious-or-cultural-needs',
      paths.applications.pages.show({
        id: application.id,
        task: 'disability-cultural-and-specific-needs',
        page: 'property-attributes-or-adaptations',
      }),
    )
  }

  completeForm() {
    this.completeYesNoInputWithDetailFromPageBody('religiousOrCulturalNeeds')
  }
}
