import { TemporaryAccommodationApplication as Application } from '@approved-premises/api'
import type { PageResponse, TaskListErrors, YesOrNo } from '@approved-premises/ui'
import { Page } from '../../../utils/decorators'

import { personName } from '../../../../utils/personUtils'
import TasklistPage from '../../../tasklistPage'
import { sentenceCase } from '../../../../utils/utils'

type SexualOffenceConvictionBody = {
  sexualOffenceConviction: YesOrNo
}

@Page({ name: 'sexual-offence-conviction', bodyProperties: ['sexualOffenceConviction'] })
export default class SexualOffenceConvictionPage implements TasklistPage {
  title: string

  htmlDocumentTitle = 'Has the person ever been convicted of a sexual offence?'

  constructor(
    readonly body: Partial<SexualOffenceConvictionBody>,
    readonly application: Application,
  ) {
    this.title = `Has ${personName(application.person)} ever been convicted of a sexual offence?`
  }

  next() {
    return this.body.sexualOffenceConviction === 'yes' ? 'registered-sex-offender' : 'sexual-behaviour-concerns'
  }

  previous() {
    return 'dashboard'
  }

  response() {
    return { [this.htmlDocumentTitle]: sentenceCase(this.body.sexualOffenceConviction) }
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.sexualOffenceConviction) {
      errors.sexualOffenceConviction = 'Select yes if the person has ever been convicted of a sexual offence'
    }

    return errors
  }
}
