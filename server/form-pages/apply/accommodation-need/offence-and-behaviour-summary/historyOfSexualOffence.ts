import { TemporaryAccommodationApplication as Application } from '@approved-premises/api'
import type { PageResponse, TaskListErrors, YesOrNo } from '@approved-premises/ui'
import { Page } from '../../../utils/decorators'

import { personName } from '../../../../utils/personUtils'
import TasklistPage from '../../../tasklistPage'
import { sentenceCase } from '../../../../utils/utils'

type HistoryOfSexualOffenceBody = {
  historyOfSexualOffence: YesOrNo
}

@Page({ name: 'history-of-sexual-offence', bodyProperties: ['historyOfSexualOffence'] })
export default class HistoryOfSexualOffencePage implements TasklistPage {
  title: string

  htmlDocumentTitle = 'Has the person ever been convicted of a sexual offence?'

  constructor(
    readonly body: Partial<HistoryOfSexualOffenceBody>,
    readonly application: Application,
  ) {
    this.title = `Has ${personName(application.person)} ever been convicted of a sexual offence?`
  }

  next() {
    return this.body.historyOfSexualOffence === 'yes' ? 'registered-sex-offender' : 'concerning-sexual-behaviour'
  }

  previous() {
    return 'dashboard'
  }

  response() {
    return { [this.htmlDocumentTitle]: sentenceCase(this.body.historyOfSexualOffence) }
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.historyOfSexualOffence) {
      errors.historyOfSexualOffence = 'Select yes if the person has ever been convicted of a sexual offence'
    }

    return errors
  }
}
