import { TemporaryAccommodationApplication as Application } from '@approved-premises/api'
import type { TaskListErrors, YesOrNoWithDetail } from '@approved-premises/ui'
import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'
import { yesOrNoResponseWithDetail } from '../../../utils'

type OtherAccommodationOptionsBody = YesOrNoWithDetail<'otherOptions'>

@Page({ name: 'other-accommodation-options', bodyProperties: ['otherOptions', 'otherOptionsDetail'] })
export default class OtherAccommodationOptions implements TasklistPage {
  title = 'Have other accommodation options been considered?'

  htmlDocumentTitle = this.title

  constructor(
    readonly body: Partial<OtherAccommodationOptionsBody>,
    readonly application: Application,
  ) {}

  response() {
    return {
      [this.title]: yesOrNoResponseWithDetail('otherOptions', this.body),
    }
  }

  previous() {
    return 'crs-submitted'
  }

  next() {
    return ''
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.otherOptions) {
      errors.otherOptions = 'You must specify if other accommodation options have been considered'
    }

    if (this.body.otherOptions === 'yes' && !this.body.otherOptionsDetail) {
      errors.otherOptionsDetail = 'You must provide details of other accommodation options considered'
    }

    return errors
  }
}
