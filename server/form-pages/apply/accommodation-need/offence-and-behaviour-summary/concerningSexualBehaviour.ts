import { TemporaryAccommodationApplication as Application } from '@approved-premises/api'
import type { TaskListErrors, TasklistPage, YesOrNo } from '@approved-premises/ui'
import { Page } from '../../../utils/decorators'
import { personName } from '../../../../utils/personUtils'
import { BodyWithYesOrNoWithDetail, yesOrNoResponseWithDetail } from '../../../utils'

type ConcerningSexualBehaviourBody = {
  concerningSexualBehaviour: YesOrNo
  concerningSexualBehaviourDetail: string
}

@Page({
  name: 'concerning-sexual-behaviour',
  bodyProperties: ['concerningSexualBehaviour', 'concerningSexualBehaviourDetail'],
})
export default class ConcerningSexualBehaviour implements TasklistPage {
  title: string

  htmlDocumentTitle = "Are there concerns about the person's sexual behaviour?"

  constructor(
    readonly body: Partial<ConcerningSexualBehaviourBody>,
    readonly application: Application,
  ) {
    this.title = `Are there concerns about ${personName(application.person)}'s sexual behaviour?`
  }

  response() {
    return {
      [this.htmlDocumentTitle]: yesOrNoResponseWithDetail(
        'concerningSexualBehaviour',
        this.body as BodyWithYesOrNoWithDetail<'concerningSexualBehaviour'>,
      ),
    }
  }

  previous() {
    return 'history-of-sexual-offence'
  }

  next() {
    return 'history-of-arson-offence'
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.concerningSexualBehaviour) {
      errors.concerningSexualBehaviour = "Select yes if there are concerns about the person's sexual behaviour"
    }
    if (this.body.concerningSexualBehaviour === 'yes' && !this.body.concerningSexualBehaviourDetail) {
      errors.concerningSexualBehaviourDetail = "Enter details about the person's sexual behaviour"
    }

    return errors
  }
}
