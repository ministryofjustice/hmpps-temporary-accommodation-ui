import { TemporaryAccommodationApplication as Application } from '@approved-premises/api'
import type { PersonRisksUI, TaskListErrors, YesOrNoWithDetail } from '@approved-premises/ui'
import { Page } from '../../../utils/decorators'

import { personName } from '../../../../utils/personUtils'
import TasklistPage from '../../../tasklistPage'
import { yesOrNoResponseWithDetail } from '../../../utils'
import { mapApiPersonRisksForUi } from '../../../../utils/utils'
import anonymiseFormContent from '../../../utils/anonymiseFormContent'

type SubstanceMisuseBody = YesOrNoWithDetail<'substanceMisuse'>

@Page({ name: 'substance-misuse', bodyProperties: ['substanceMisuse', 'substanceMisuseDetail'] })
export default class SubstanceMisuse implements TasklistPage {
  title = 'Substance misuse'

  htmlDocumentTitle = this.title

  questions: {
    substanceMisuse: string
  }

  risks: PersonRisksUI

  constructor(
    readonly body: Partial<SubstanceMisuseBody>,
    readonly application: Application,
  ) {
    this.questions = {
      substanceMisuse: `Does ${personName(
        application.person,
      )} have any current or previous issues with drug or alcohol misuse?`,
    }

    this.risks = mapApiPersonRisksForUi(application.risks)
  }

  response() {
    return {
      [anonymiseFormContent(this.questions.substanceMisuse, this.application.person)]: yesOrNoResponseWithDetail(
        'substanceMisuse',
        this.body,
      ),
    }
  }

  previous() {
    return 'anti-social-behaviour'
  }

  next() {
    return 'rosh-level'
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.substanceMisuse) {
      errors.substanceMisuse = `You must specify if ${personName(
        this.application.person,
      )} has any current or previous issues with drug or alcohol misuse`
    }

    if (this.body.substanceMisuse === 'yes' && !this.body.substanceMisuseDetail) {
      errors.substanceMisuseDetail =
        "You must provide information on the person's substance misuse and how you will support their placement given these issues"
    }

    return errors
  }
}
