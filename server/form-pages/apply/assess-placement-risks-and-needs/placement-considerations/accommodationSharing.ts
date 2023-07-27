import { TemporaryAccommodationApplication as Application } from '@approved-premises/api'
import type { PersonRisksUI, TaskListErrors } from '@approved-premises/ui'
import { Page } from '../../../utils/decorators'

import { mapApiPersonRisksForUi } from '../../../../utils/utils'
import TasklistPage from '../../../tasklistPage'

type AccommodationSharingBody = {
  accommodationSharing: string
  accommodationSharingYesDetail: string
  accommodationSharingNoDetail: string
}

@Page({
  name: 'accommodation-sharing',
  bodyProperties: ['accommodationSharing', 'accommodationSharingYesDetail', 'accommodationSharingNoDetail'],
})
export default class AccommodationSharing implements TasklistPage {
  title = 'Accommodation sharing'

  questions: {
    accommodationSharing: string
  }

  risks: PersonRisksUI

  constructor(
    readonly body: Partial<AccommodationSharingBody>,
    readonly application: Application,
  ) {
    this.questions = {
      accommodationSharing: `Is ${application.person.name} suitable to share accommodation with others?`,
    }

    this.risks = mapApiPersonRisksForUi(application.risks)
  }

  response() {
    if (this.body.accommodationSharing === 'yes') {
      return {
        [this.questions.accommodationSharing]: `Yes - ${this.body.accommodationSharingYesDetail}`,
      }
    }
    return {
      [this.questions.accommodationSharing]: `No - ${this.body.accommodationSharingNoDetail}`,
    }
  }

  previous() {
    return 'dashboard'
  }

  next() {
    return 'cooperation'
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.accommodationSharing) {
      errors.accommodationSharing = `You must specify if ${this.application.person.name} would be able to share accommodation with others`
    }

    if (this.body.accommodationSharing === 'yes' && !this.body.accommodationSharingYesDetail) {
      errors.accommodationSharingYesDetail =
        "You must provide details of how you will manage the person's risk if they are placed in shared accommodation"
    }

    if (this.body.accommodationSharing === 'no' && !this.body.accommodationSharingNoDetail) {
      errors.accommodationSharingNoDetail =
        'You must provide details of why this person is unsuitable to share accommodation with others'
    }

    return errors
  }
}
