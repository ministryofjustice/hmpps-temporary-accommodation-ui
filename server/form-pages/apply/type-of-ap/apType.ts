import type { Application } from '@approved-premises/api'
import type { TaskListErrors } from '@approved-premises/ui'

import TasklistPage from '../../tasklistPage'
import { convertKeyValuePairToRadioItems } from '../../../utils/formUtils'

const apTypes = {
  standard: 'Standard',
  pipe: 'PIPE (physcologically informed planned environment)',
  esap: 'ESAP (enhanced security AP)',
} as const

type ApTypes = typeof apTypes

export default class ApType implements TasklistPage {
  name = 'ap-type'

  title = `Which type of AP does ${this.application.person.name} require?`

  body: { type: keyof ApTypes }

  constructor(body: Record<string, unknown>, private readonly application: Application) {
    this.body = {
      type: body.type as keyof ApTypes,
    }
  }

  previous() {
    return ''
  }

  next() {
    if (this.body.type === 'pipe') {
      return 'pipe-referral'
    }
    if (this.body.type === 'esap') {
      return 'esap-placement-screening'
    }

    return null
  }

  response() {
    return { [`${this.title}`]: apTypes[this.body.type] }
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.type) {
      errors.type = 'You must specify an AP type'
    }

    return errors
  }

  items() {
    return convertKeyValuePairToRadioItems(apTypes, this.body.type)
  }
}
