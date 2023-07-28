import { TemporaryAccommodationApplication as Application } from '@approved-premises/api'
import type { TaskListErrors } from '@approved-premises/ui'
import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'

type SupportInTheCommunityBody = {
  support: string
}

@Page({ name: 'support-in-the-community', bodyProperties: ['support'] })
export default class SupportInTheCommunity implements TasklistPage {
  title = 'Support in the community'

  constructor(
    readonly body: Partial<SupportInTheCommunityBody>,
    readonly application: Application,
  ) {}

  response() {
    return {
      'Details of support in the community': this.body.support,
    }
  }

  previous() {
    return 'safeguarding-and-vulnerability'
  }

  next() {
    return 'local-connections'
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.support) {
      errors.support = 'You must provide details of what support is or will be in place'
    }

    return errors
  }
}
