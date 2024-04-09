import type { TemporaryAccommodationApplication } from '@approved-premises/api'
import paths from '../../../../../server/paths/apply'
import ApplyPage from '../../applyPage'
import { personName } from '../../../../../server/utils/personUtils'

export default class SexualBehaviourConcernsPage extends ApplyPage {
  constructor(application: TemporaryAccommodationApplication) {
    super(
      `Are there concerns about ${personName(application.person)}'s sexual behaviour?`,
      application,
      'offence-and-behaviour-summary',
      'sexual-behaviour-concerns',
      paths.applications.show({
        id: application.id,
      }),
    )
  }

  completeForm() {
    this.completeYesNoInputWithDetailFromPageBody('sexualBehaviourConcerns')
  }
}
