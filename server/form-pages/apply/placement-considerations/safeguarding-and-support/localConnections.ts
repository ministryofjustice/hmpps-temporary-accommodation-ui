import { TemporaryAccommodationApplication as Application } from '@approved-premises/api'
import type { TaskListErrors } from '@approved-premises/ui'
import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'

type LocalConnectionsBody = {
  localConnections: string
}

@Page({ name: 'local-connections', bodyProperties: ['localConnections'] })
export default class LocalConnections implements TasklistPage {
  title = 'Local connections'

  constructor(
    readonly body: Partial<LocalConnectionsBody>,
    readonly application: Application,
  ) {}

  response() {
    return {
      'Details of local connections': this.body.localConnections,
    }
  }

  previous() {
    return 'support-in-the-community'
  }

  next() {
    return 'caring-responsibilities'
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.localConnections) {
      errors.localConnections = 'You must provide details of local connections'
    }

    return errors
  }
}
