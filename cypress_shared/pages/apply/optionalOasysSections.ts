import { ApprovedPremisesApplication, OASysSection } from '@approved-premises/api'
import paths from '../../../server/paths/apply'

import ApplyPage from './applyPage'

export default class OptionalOasysSectionsPage extends ApplyPage {
  constructor(application: ApprovedPremisesApplication) {
    super(
      'Which of the following sections of OASys do you want to import?',
      application,
      'oasys-import',
      'optional-oasys-sections',
      paths.applications.show({ id: application.id }),
    )
  }

  completeForm(oasysSectionsLinkedToReoffending: Array<OASysSection>, otherOasysSections: Array<OASysSection>): void {
    oasysSectionsLinkedToReoffending.forEach(oasysSection => {
      this.checkCheckboxByNameAndValue('needsLinkedToReoffending', oasysSection.section.toString())
    })

    otherOasysSections.forEach(oasysSection => {
      this.checkRadioByNameAndValue('otherNeeds', oasysSection.section.toString())
    })
  }
}
