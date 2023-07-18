import { TemporaryAccommodationApplication as Application } from '@approved-premises/api'
import type { TaskListErrors, YesOrNo } from '@approved-premises/ui'
import { Page } from '../../../utils/decorators'

import { sentenceCase } from '../../../../utils/utils'
import TasklistPage from '../../../tasklistPage'

type DtrSubmittedBody = {
  dtrSubmitted: YesOrNo
}

@Page({ name: 'dtr-submitted', bodyProperties: ['dtrSubmitted'] })
export default class DtrSubmitted implements TasklistPage {
  title = 'Has the Duty to Refer (DTR) / National Offender Pathway (NOP) been submitted?'

  constructor(
    readonly body: Partial<DtrSubmittedBody>,
    readonly application: Application,
  ) {}

  response() {
    return { [this.title]: sentenceCase(this.body.dtrSubmitted) }
  }

  previous() {
    return 'dashboard'
  }

  next() {
    return this.body.dtrSubmitted === 'yes' ? 'dtr-details' : 'crs-submitted'
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.dtrSubmitted) {
      errors.dtrSubmitted =
        'You must specify if the Duty to Refer (DTR) / National Offender Pathway (NOP) has been submitted'
    }

    return errors
  }
}
