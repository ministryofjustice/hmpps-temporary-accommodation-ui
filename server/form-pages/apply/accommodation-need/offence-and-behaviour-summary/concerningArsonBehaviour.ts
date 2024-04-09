import { TemporaryAccommodationApplication as Application } from '@approved-premises/api'
import type { TaskListErrors, TasklistPage, YesOrNo } from '@approved-premises/ui'
import { Page } from '../../../utils/decorators'
import { personName } from '../../../../utils/personUtils'
import { BodyWithYesOrNoWithDetail, yesOrNoResponseWithDetail } from '../../../utils'

type ConcerningArsonBehaviourBody = {
  concerningArsonBehaviour: YesOrNo
  concerningArsonBehaviourDetail: string
}

@Page({
  name: 'concerning-arson-behaviour',
  bodyProperties: ['concerningArsonBehaviour', 'concerningArsonBehaviourDetail'],
})
export default class ConcerningArsonBehaviour implements TasklistPage {
  title: string

  htmlDocumentTitle = "Are there concerns about the person's arson behaviour?"

  constructor(
    readonly body: Partial<ConcerningArsonBehaviourBody>,
    readonly application: Application,
  ) {
    this.title = `Are there concerns about ${personName(application.person)}'s arson behaviour?`
  }

  response() {
    return {
      [this.htmlDocumentTitle]: yesOrNoResponseWithDetail(
        'concerningArsonBehaviour',
        this.body as BodyWithYesOrNoWithDetail<'concerningArsonBehaviour'>,
      ),
    }
  }

  previous() {
    return 'history-of-arson-offence'
  }

  next() {
    return ''
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.concerningArsonBehaviour) {
      errors.concerningArsonBehaviour = "Select yes if there are concerns about the person's arson behaviour"
    }
    if (this.body.concerningArsonBehaviour === 'yes' && !this.body.concerningArsonBehaviourDetail) {
      errors.concerningArsonBehaviourDetail = "Enter details about the person's arson behaviour"
    }

    return errors
  }
}
