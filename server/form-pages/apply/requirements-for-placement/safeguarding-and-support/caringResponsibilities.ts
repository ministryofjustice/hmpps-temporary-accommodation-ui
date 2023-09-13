import { TemporaryAccommodationApplication as Application } from '@approved-premises/api'
import type { TaskListErrors, YesOrNoWithDetail } from '@approved-premises/ui'
import { Page } from '../../../utils/decorators'

import { personName } from '../../../../utils/personUtils'
import TasklistPage from '../../../tasklistPage'
import { yesOrNoResponseWithDetail } from '../../../utils'

type CaringResponsibilitiesBody = YesOrNoWithDetail<'caringResponsibilities'>

@Page({ name: 'caring-responsibilities', bodyProperties: ['caringResponsibilities', 'caringResponsibilitiesDetail'] })
export default class CaringResponsibilities implements TasklistPage {
  title = 'Caring responsibilities'

  htmlDocumentTitle = this.title

  questions: {
    caringResponsibilities: string
  }

  constructor(
    readonly body: Partial<CaringResponsibilitiesBody>,
    readonly application: Application,
  ) {
    this.questions = {
      caringResponsibilities: `Does ${personName(application.person)} have any caring responsibilities?`,
    }
  }

  response() {
    return {
      'Does this person have any caring responsibilities?': yesOrNoResponseWithDetail(
        'caringResponsibilities',
        this.body,
      ),
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
      errors.caringResponsibilities = `You must specify if ${personName(
        this.application.person,
      )} has any caring responsibilities`
    }

    if (this.body.caringResponsibilities === 'yes' && !this.body.caringResponsibilitiesDetail) {
      errors.caringResponsibilitiesDetail = 'You must provide details of any caring responsibilities'
    }

    return errors
  }
}
