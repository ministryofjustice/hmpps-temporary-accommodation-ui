import { TemporaryAccommodationApplication as Application } from '@approved-premises/api'
import type { PersonRisksUI, TaskListErrors } from '@approved-premises/ui'
import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'
import { mapApiPersonRisksForUi } from '../../../../utils/utils'

type RoshLevelBody = {
  riskToChildren: string
  riskToPublic: string
  riskToKnownAdult: string
  riskToStaff: string
}

@Page({
  name: 'rosh-level',
  bodyProperties: ['riskToChildren', 'riskToPublic', 'riskToKnownAdult', 'riskToStaff'],
})
export default class RoshLevel implements TasklistPage {
  title = 'RoSH level'

  htmlDocumentTitle = this.title

  risks: PersonRisksUI

  constructor(
    readonly body: Partial<RoshLevelBody>,
    readonly application: Application,
  ) {
    this.risks = mapApiPersonRisksForUi(application.risks)
  }

  response() {
    return {
      'How will risk to children impact placement?': this.body.riskToChildren,
      'How will risk to public impact placement?': this.body.riskToPublic,
      'How will risk to known adult impact placement?': this.body.riskToKnownAdult,
      'How will risk to staff impact placement?': this.body.riskToStaff,
    }
  }

  previous() {
    return 'substance-misuse'
  }

  next() {
    return 'risk-management-plan'
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.riskToChildren) {
      errors.riskToChildren = 'You must provide details on how risk to children will impact placement'
    }

    if (!this.body.riskToPublic) {
      errors.riskToPublic = 'You must provide details on how risk to public will impact placement'
    }

    if (!this.body.riskToKnownAdult) {
      errors.riskToKnownAdult = 'You must provide details on how risk to known adult will impact placement'
    }

    if (!this.body.riskToStaff) {
      errors.riskToStaff = 'You must provide details on how risk to staff will impact placement'
    }

    return errors
  }
}
