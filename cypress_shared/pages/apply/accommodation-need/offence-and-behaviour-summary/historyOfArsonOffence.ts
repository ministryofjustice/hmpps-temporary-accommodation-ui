import type { TemporaryAccommodationApplication } from '@approved-premises/api'
import paths from '../../../../../server/paths/apply'
import ApplyPage from '../../applyPage'
import { personName } from '../../../../../server/utils/personUtils'

export default class HistoryOfArsonOffencePage extends ApplyPage {
  constructor(application: TemporaryAccommodationApplication) {
    super(
      `Has ${personName(application.person)} ever been convicted of arson?`,
      application,
      'offence-and-behaviour-summary',
      'history-of-arson-offence',
      paths.applications.show({
        id: application.id,
      }),
    )
  }

  completeForm() {
    this.checkRadioButtonFromPageBody('historyOfArsonOffence')
  }
}
