import { TemporaryAccommodationApplication as Application } from '@approved-premises/api'
import type { TaskListErrors, TasklistPage, YesOrNo } from '@approved-premises/ui'
import { Page } from '../../../utils/decorators'
import { personName } from '../../../../utils/personUtils'
import { sentenceCase } from '../../../../utils/utils'

type RegisteredSexOffenderBody = {
  registeredSexOffender: YesOrNo
}

@Page({ name: 'registered-sex-offender', bodyProperties: ['registeredSexOffender'] })
export default class RegisteredSexOffender implements TasklistPage {
  title: string

  htmlDocumentTitle = 'Is the person a Registered Sex Offender (RSO)?'

  constructor(
    readonly body: Partial<RegisteredSexOffenderBody>,
    readonly application: Application,
  ) {
    this.title = `Is ${personName(application.person)} a Registered Sex Offender (RSO)?`
  }

  response() {
    return { [this.htmlDocumentTitle]: sentenceCase(this.body.registeredSexOffender) }
  }

  previous() {
    return 'sexual-offence-conviction'
  }

  next() {
    return ''
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.registeredSexOffender) {
      errors.registeredSexOffender = 'Select yes if the person is a Registered Sex Offender (RSO)'
    }

    return errors
  }
}
