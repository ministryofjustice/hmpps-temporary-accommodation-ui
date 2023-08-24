import type { TemporaryAccommodationApplication } from '@approved-premises/api'
import paths from '../../../../../server/paths/apply'
import { personName } from '../../../../../server/utils/personUtils'
import ApplyPage from '../../applyPage'

export default class PropertyAttributesOrAdaptationsPage extends ApplyPage {
  constructor(application: TemporaryAccommodationApplication) {
    super(
      `Will ${personName(application.person)} require a property with specific attributes or adaptations?`,
      application,
      'disability-cultural-and-specific-needs',
      'property-attributes-or-adaptations',
      paths.applications.pages.show({
        id: application.id,
        task: 'disability-cultural-and-specific-needs',
        page: 'needs',
      }),
    )
  }

  completeForm() {
    this.completeYesNoInputWithDetailFromPageBody('propertyAttributesOrAdaptations')
  }
}
