import type { TaskListErrors } from '@approved-premises/ui'
import type { TemporaryAccommodationApplication } from '@approved-premises/api'
import { Page } from '../../utils/decorators'

import TasklistPage from '../../tasklistPage'

@Page({ name: 'review', bodyProperties: ['reviewed'] })
export default class Review implements TasklistPage {
  name = 'review'

  title = 'Check your answers'

  htmlDocumentTitle = this.title

  constructor(
    public body: { reviewed?: string },
    readonly application: TemporaryAccommodationApplication,
  ) {}

  previous() {
    return 'dashboard'
  }

  next() {
    return ''
  }

  response() {
    return {}
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    return errors
  }
}
