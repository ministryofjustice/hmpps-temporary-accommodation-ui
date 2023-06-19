import { TemporaryAccommodationApplication as Application } from '@approved-premises/api'
import type { TaskListErrors, YesOrNoWithDetail } from '@approved-premises/ui'
import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'
import { yesOrNoResponseWithDetail } from '../../../utils'

type CaringResponsibilitiesBody = YesOrNoWithDetail<'caringResponsibilities'>

@Page({ name: 'caring-responsibilities', bodyProperties: ['caringResponsibilities', 'caringResponsibilitiesDetail'] })
export default class CaringResponsibilities implements TasklistPage {
  title = 'Caring responsibilities'

  questions: {
    caringResponsibilities: string
  }

  constructor(readonly body: Partial<CaringResponsibilitiesBody>, readonly application: Application) {
    this.questions = {
      caringResponsibilities: `Does ${application.person.name} have any caring responsibilities?`,
    }
  }

  response() {
    return {
      [this.questions.caringResponsibilities]: yesOrNoResponseWithDetail('caringResponsibilities', this.body),
    }
  }

  previous() {
    return 'local-connections'
  }

  next() {
    return ''
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.caringResponsibilities) {
      errors.caringResponsibilities = `You must specify if ${this.application.person.name} has any caring responsibilities`
    }

    if (this.body.caringResponsibilities === 'yes' && !this.body.caringResponsibilitiesDetail) {
      errors.caringResponsibilitiesDetail = 'You must provide details of any caring responsibilities'
    }

    return errors
  }
}
