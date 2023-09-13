import { TemporaryAccommodationApplication as Application } from '@approved-premises/api'
import type { TaskListErrors, YesOrNoWithDetail } from '@approved-premises/ui'
import { Page } from '../../../utils/decorators'

import { personName } from '../../../../utils/personUtils'
import TasklistPage from '../../../tasklistPage'
import { yesOrNoResponseWithDetail } from '../../../utils'

type ReligiousOrCulturalNeedsBody = YesOrNoWithDetail<'religiousOrCulturalNeeds'>

@Page({
  name: 'religious-or-cultural-needs',
  bodyProperties: ['religiousOrCulturalNeeds', 'religiousOrCulturalNeedsDetail'],
})
export default class ReligiousOrCulturalNeeds implements TasklistPage {
  title: string

  htmlDocumentTitle = 'Does the person have any religious or cultural needs?'

  constructor(
    readonly body: Partial<ReligiousOrCulturalNeedsBody>,
    readonly application: Application,
  ) {
    this.title = `Does ${personName(application.person)} have any religious or cultural needs?`
  }

  response() {
    return {
      'Does this person have any religious or cultural needs?': yesOrNoResponseWithDetail(
        'religiousOrCulturalNeeds',
        this.body,
      ),
    }
  }

  previous() {
    return 'property-attributes-or-adaptations'
  }

  next() {
    return ''
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.religiousOrCulturalNeeds) {
      errors.religiousOrCulturalNeeds = `You must specify if ${personName(
        this.application.person,
      )} has any religious or cultural needs`
    }

    if (this.body.religiousOrCulturalNeeds === 'yes' && !this.body.religiousOrCulturalNeedsDetail) {
      errors.religiousOrCulturalNeedsDetail = `You must provide details of ${personName(
        this.application.person,
      )}'s religious or cultural needs`
    }

    return errors
  }
}
