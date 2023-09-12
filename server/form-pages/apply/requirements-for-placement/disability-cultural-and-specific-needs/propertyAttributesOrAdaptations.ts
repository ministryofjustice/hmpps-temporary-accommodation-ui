import { TemporaryAccommodationApplication as Application } from '@approved-premises/api'
import type { TaskListErrors, YesOrNoWithDetail } from '@approved-premises/ui'
import { Page } from '../../../utils/decorators'

import { personName } from '../../../../utils/personUtils'
import TasklistPage from '../../../tasklistPage'
import { yesOrNoResponseWithDetail } from '../../../utils'
import anonymiseFormContent from '../../../utils/anonymiseFormContent'

type PropertyAttributesOrAdaptationsBody = YesOrNoWithDetail<'propertyAttributesOrAdaptations'>

@Page({
  name: 'property-attributes-or-adaptations',
  bodyProperties: ['propertyAttributesOrAdaptations', 'propertyAttributesOrAdaptationsDetail'],
})
export default class PropertyAttributesOrAdaptations implements TasklistPage {
  title: string

  htmlDocumentTitle = 'Will the person require a property with specific attributes or adaptations?'

  constructor(
    readonly body: Partial<PropertyAttributesOrAdaptationsBody>,
    readonly application: Application,
  ) {
    this.title = `Will ${personName(application.person)} require a property with specific attributes or adaptations?`
  }

  response() {
    return {
      [anonymiseFormContent(this.title, this.application.person)]: yesOrNoResponseWithDetail(
        'propertyAttributesOrAdaptations',
        this.body,
      ),
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
      errors.propertyAttributesOrAdaptations = `You must specify if ${personName(
        this.application.person,
      )} requires a property with specific attributes or adaptations`
    }

    if (this.body.propertyAttributesOrAdaptations === 'yes' && !this.body.propertyAttributesOrAdaptationsDetail) {
      errors.propertyAttributesOrAdaptationsDetail = 'You must provide details of what is required'
    }

    return errors
  }
}
