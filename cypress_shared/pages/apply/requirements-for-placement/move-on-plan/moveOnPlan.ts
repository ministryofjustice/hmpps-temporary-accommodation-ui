import { TemporaryAccommodationApplication as Application } from '@approved-premises/api'
import paths from '../../../../../server/paths/apply'

import ApplyPage from '../../applyPage'
import { personName } from '../../../../../server/utils/personUtils'

export default class MoveOnPlan extends ApplyPage {
  constructor(application: Application) {
    super(
      `How will you prepare ${personName(application.person)} for move on after placement?`,
      application,
      'move-on-plan',
      'move-on-plan',
      paths.applications.show({ id: application.id }),
    )
  }

  completeForm() {
    this.completeTextInputFromPageBody('plan')
  }
}
