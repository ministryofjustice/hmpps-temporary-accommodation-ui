import { TemporaryAccommodationApplication as Application } from '@approved-premises/api'
import type { TaskListErrors, YesOrNoWithDetail } from '@approved-premises/ui'
import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'
import { yesOrNoResponseWithDetail } from '../../../utils'

type AlternativePduBody = YesOrNoWithDetail<'alternativePdu'>

@Page({ name: 'alternative-pdu', bodyProperties: ['alternativePdu', 'alternativePduDetail'] })
export default class AlternativePdu implements TasklistPage {
  title = 'Is placement required in an alternative PDU?'

  constructor(readonly body: Partial<AlternativePduBody>, readonly application: Application) {}

  response() {
    return {
      [this.title]: yesOrNoResponseWithDetail('alternativePdu', this.body),
    }
  }

  previous() {
    return 'dashboard'
  }

  next() {
    return ''
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.alternativePdu) {
      errors.alternativePdu = 'You must specify if placement is required in an alternative PDU'
    }

    if (this.body.alternativePdu === 'yes' && !this.body.alternativePduDetail) {
      errors.alternativePduDetail = 'You must provide the alternative PDU and the reason it is preferred'
    }

    return errors
  }
}
