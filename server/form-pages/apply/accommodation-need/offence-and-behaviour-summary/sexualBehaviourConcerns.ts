import { TemporaryAccommodationApplication as Application } from '@approved-premises/api'
import type { TaskListErrors, TasklistPage, YesOrNo } from '@approved-premises/ui'
import { Page } from '../../../utils/decorators'
import { personName } from '../../../../utils/personUtils'
import { BodyWithYesOrNoWithDetail, yesOrNoResponseWithDetail } from '../../../utils'

type SexualBehaviourConcernsBody = {
  sexualBehaviourConcerns: YesOrNo
  sexualBehaviourConcernsDetail: string
}

@Page({
  name: 'sexual-behaviour-concerns',
  bodyProperties: ['sexualBehaviourConcerns', 'sexualBehaviourConcernsDetail'],
})
export default class SexualBehaviourConcerns implements TasklistPage {
  title: string

  htmlDocumentTitle = "Are there concerns about the person's sexual behaviour?"

  constructor(
    readonly body: Partial<SexualBehaviourConcernsBody>,
    readonly application: Application,
  ) {
    this.title = `Are there concerns about ${personName(application.person)}'s sexual behaviour?`
  }

  response() {
    return {
      [this.htmlDocumentTitle]: yesOrNoResponseWithDetail(
        'sexualBehaviourConcerns',
        this.body as BodyWithYesOrNoWithDetail<'sexualBehaviourConcerns'>,
      ),
    }
  }

  previous() {
    return 'sexual-offence-conviction'
  }

  next() {
    return ''
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.sexualBehaviourConcerns) {
      errors.sexualBehaviourConcerns = "Select yes if there are concerns about the person's sexual behaviour"
    }
    if (this.body.sexualBehaviourConcerns === 'yes' && !this.body.sexualBehaviourConcernsDetail) {
      errors.sexualBehaviourConcernsDetail = "Enter details about the person's sexual behaviour"
    }

    return errors
  }
}
