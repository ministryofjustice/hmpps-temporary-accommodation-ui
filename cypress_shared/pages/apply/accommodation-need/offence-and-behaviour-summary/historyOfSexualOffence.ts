import type { TemporaryAccommodationApplication } from '../../../../../server/@types/shared'

import paths from '../../../../../server/paths/apply'
import { personName } from '../../../../../server/utils/personUtils'
import ApplyPage from '../../applyPage'

export default class HistoryOfSexualOffencePage extends ApplyPage {
  constructor(application: TemporaryAccommodationApplication) {
    super(
      `Has ${personName(application.person)} ever been convicted of a sexual offence?`,
      application,
      'offence-and-behaviour-summary',
      'history-of-sexual-offence',
      paths.applications.show({ id: application.id }),
    )
  }

  completeForm() {
    this.checkRadioButtonFromPageBody('historyOfSexualOffence')
  }
}
