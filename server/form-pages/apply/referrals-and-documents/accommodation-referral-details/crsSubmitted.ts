import { TemporaryAccommodationApplication as Application } from '@approved-premises/api'
import type { TaskListErrors, YesOrNo } from '@approved-premises/ui'
import { Page } from '../../../utils/decorators'

import { sentenceCase } from '../../../../utils/utils'
import TasklistPage from '../../../tasklistPage'
import { hasSubmittedDtr } from '../../../utils'

type CrsSubmittedBody = {
  crsSubmitted: YesOrNo
}

@Page({ name: 'crs-submitted', bodyProperties: ['crsSubmitted'] })
export default class CrsSubmitted implements TasklistPage {
  title = 'Has a referral to Commissioned Rehabilitative Services (CRS) been submitted?'

  constructor(
    readonly body: Partial<CrsSubmittedBody>,
    readonly application: Application,
  ) {}

  response() {
    return { [this.title]: sentenceCase(this.body.crsSubmitted) }
  }

  previous() {
    return hasSubmittedDtr(this.application) ? 'dtr-details' : 'dtr-submitted'
  }

  next() {
    return 'other-accommodation-options'
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.crsSubmitted) {
      errors.crsSubmitted =
        'You must specify if a referral to Commissioned Rehabilitative Services (CRS) has been submitted'
    }

    return errors
  }
}
