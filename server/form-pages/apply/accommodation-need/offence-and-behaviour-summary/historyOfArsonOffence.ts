import { TemporaryAccommodationApplication as Application } from '@approved-premises/api'
import type { TaskListErrors, TasklistPage, YesOrNo } from '@approved-premises/ui'
import { Page } from '../../../utils/decorators'
import { personName } from '../../../../utils/personUtils'
import { sentenceCase } from '../../../../utils/utils'

type HistoryOfArsonOffenceBody = {
  historyOfArsonOffence: YesOrNo
}

@Page({ name: 'history-of-arson-offence', bodyProperties: ['historyOfArsonOffence'] })
export default class HistoryOfArsonOffence implements TasklistPage {
  title: string

  htmlDocumentTitle = 'Has the person ever been convicted of arson?'

  constructor(
    readonly body: Partial<HistoryOfArsonOffenceBody>,
    readonly application: Application,
  ) {
    this.title = `Has ${personName(application.person)} ever been convicted of arson?`
  }

  response() {
    return { [this.htmlDocumentTitle]: sentenceCase(this.body.historyOfArsonOffence) }
  }

  previous() {
    return this.application.data['offence-and-behaviour-summary']['history-of-sexual-offence']
      .historyOfSexualOffence === 'yes'
      ? 'registered-sex-offender'
      : 'concerning-sexual-behaviour'
  }

  next() {
    return ''
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.historyOfArsonOffence) {
      errors.historyOfArsonOffence = 'Select yes if the person has ever been convicted of arson'
    }

    return errors
  }
}
