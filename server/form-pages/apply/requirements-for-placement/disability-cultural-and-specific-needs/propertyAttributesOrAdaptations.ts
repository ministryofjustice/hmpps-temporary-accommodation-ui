import { TemporaryAccommodationApplication as Application } from '@approved-premises/api'
import type { TaskListErrors, YesOrNoWithDetail } from '@approved-premises/ui'
import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'
import { yesOrNoResponseWithDetail } from '../../../utils'

type PropertyAttributesOrAdaptationsBody = YesOrNoWithDetail<'propertyAttributesOrAdaptations'>

@Page({
  name: 'property-attributes-or-adaptations',
  bodyProperties: ['propertyAttributesOrAdaptations', 'propertyAttributesOrAdaptationsDetail'],
})
export default class PropertyAttributesOrAdaptations implements TasklistPage {
  title: string

  constructor(
    readonly body: Partial<PropertyAttributesOrAdaptationsBody>,
    readonly application: Application,
  ) {
    this.title = `Will ${application.person.name} require a property with specific attributes or adaptations?`
  }

  response() {
    return {
      [this.title]: yesOrNoResponseWithDetail('propertyAttributesOrAdaptations', this.body),
    }
  }

  previous() {
    return 'needs'
  }

  next() {
    return 'religious-or-cultural-needs'
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.propertyAttributesOrAdaptations) {
      errors.propertyAttributesOrAdaptations = `You must specify if ${this.application.person.name} requires a property with specific attributes or adaptations`
    }

    if (this.body.propertyAttributesOrAdaptations === 'yes' && !this.body.propertyAttributesOrAdaptationsDetail) {
      errors.propertyAttributesOrAdaptationsDetail = 'You must provide details of what is required'
    }

    return errors
  }
}
