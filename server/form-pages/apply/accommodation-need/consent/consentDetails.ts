import { TemporaryAccommodationApplication as Application } from '@approved-premises/api'
import type { TaskListErrors } from '@approved-premises/ui'
import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'

type ConsentDetailsBody = {
  consentType: 'verbal' | 'written' | 'other'
  consentTypeDetail: string
}

@Page({ name: 'consent-details', bodyProperties: ['consentType', 'consentTypeDetail'] })
export default class ConsentDetails implements TasklistPage {
  title = 'How was consent given?'

  constructor(readonly body: Partial<ConsentDetailsBody>, readonly application: Application) {}

  response() {
    let value: string

    if (this.body.consentType === 'verbal') {
      value = 'Verbal'
    } else if (this.body.consentType === 'written') {
      value = 'Written'
    } else {
      value = `Other - ${this.body.consentTypeDetail}`
    }

    return { [this.title]: value }
  }

  previous() {
    return 'consent-given'
  }

  next() {
    return ''
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.consentType) {
      errors.consentType = 'You must specify how consent was given'
    }

    if (this.body.consentType === 'other' && !this.body.consentTypeDetail) {
      errors.consentTypeDetail = 'You must specify how consent was given'
    }

    return errors
  }
}
