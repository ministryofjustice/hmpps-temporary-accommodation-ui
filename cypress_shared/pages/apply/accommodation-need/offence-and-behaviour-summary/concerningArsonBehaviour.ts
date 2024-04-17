import type { TemporaryAccommodationApplication } from '@approved-premises/api'
import paths from '../../../../../server/paths/apply'
import ApplyPage from '../../applyPage'
import { personName } from '../../../../../server/utils/personUtils'

export default class ConcerningArsonBehaviourPage extends ApplyPage {
  constructor(application: TemporaryAccommodationApplication) {
    super(
      `Are there concerns about ${personName(application.person)}'s arson behaviour?`,
      application,
      'offence-and-behaviour-summary',
      'concerning-arson-behaviour',
      paths.applications.show({
        id: application.id,
      }),
    )
  }

  completeForm() {
    this.completeYesNoInputWithDetailFromPageBody('concerningArsonBehaviour')
  }
}
