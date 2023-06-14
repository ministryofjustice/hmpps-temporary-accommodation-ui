import { TemporaryAccommodationApplication as Application } from '@approved-premises/api'
import type { TaskListErrors, YesOrNoWithDetail } from '@approved-premises/ui'
import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'
import { yesOrNoResponseWithDetail } from '../../../utils'

type PropertySharingBody = YesOrNoWithDetail<'propertySharing'>

@Page({ name: 'property-sharing', bodyProperties: ['propertySharing', 'propertySharingDetail'] })
export default class PropertySharing implements TasklistPage {
  title = 'Property sharing'

  questions: {
    propertySharing: string
  }

  constructor(readonly body: Partial<PropertySharingBody>, readonly application: Application) {
    this.questions = {
      propertySharing: `Would ${application.person.name} be able to share accommodation with others?`,
    }
  }

  response() {
    return {
      [this.questions.propertySharing]: yesOrNoResponseWithDetail('propertySharing', this.body),
    }
  }

  previous() {
    return 'dashboard'
  }

  next() {
    return 'food-allergies'
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.propertySharing) {
      errors.propertySharing = `You must specifiy if ${this.application.person.name} would be able to share accommodation with others`
    }

    if (this.body.propertySharing === 'yes' && !this.body.propertySharingDetail) {
      errors.propertySharingDetail = `You must provide details of how you will manage risk if ${this.application.person.name} is placed in shared accommodation`
    }

    return errors
  }
}
