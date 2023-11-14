import { TemporaryAccommodationApplication as Application } from '@approved-premises/api'
import type { PersonRisksUI, TaskListErrors } from '@approved-premises/ui'
import { Page } from '../../../utils/decorators'

import { personName } from '../../../../utils/personUtils'
import { mapApiPersonRisksForUi } from '../../../../utils/utils'
import TasklistPage from '../../../tasklistPage'
import anonymiseFormContent from '../../../utils/anonymiseFormContent'

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

  htmlDocumentTitle = this.title

  questions: {
    accommodationSharing: string
  }

  risks: PersonRisksUI

  constructor(
    readonly body: Partial<AccommodationSharingBody>,
    readonly application: Application,
  ) {
    this.questions = {
      accommodationSharing: `Is ${personName(application.person)} suitable to share accommodation with others?`,
    }

    this.risks = mapApiPersonRisksForUi(application.risks)
  }

  response() {
    const formContent = anonymiseFormContent(this.questions.accommodationSharing, this.application.person)

    if (this.body.accommodationSharing === 'yes') {
      return {
        [formContent]: `Yes - ${this.body.accommodationSharingYesDetail}`,
      }
    }
    return {
      [formContent]: `No - ${this.body.accommodationSharingNoDetail}`,
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
      errors.accommodationSharing = `You must specify if ${personName(
        this.application.person,
      )} would be able to share accommodation with others`
    }

    if (this.body.accommodationSharing === 'yes' && !this.body.accommodationSharingYesDetail) {
      errors.accommodationSharingYesDetail =
        "You must provide details of how you will manage the person's risk if they are placed in shared accommodation"
    }

    if (this.body.accommodationSharing === 'no' && !this.body.accommodationSharingNoDetail) {
      errors.accommodationSharingNoDetail =
        'You must provide details of why the person is unsuitable to share accommodation with others'
    }

    return errors
  }
}
