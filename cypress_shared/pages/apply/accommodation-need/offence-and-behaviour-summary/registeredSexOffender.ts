import type { TemporaryAccommodationApplication } from '@approved-premises/api'
import paths from '../../../../../server/paths/apply'
import { personName } from '../../../../../server/utils/personUtils'
import ApplyPage from '../../applyPage'

export default class RegisteredSexOffenderPage extends ApplyPage {
  constructor(application: TemporaryAccommodationApplication) {
    super(
      `Is ${personName(application.person)} a Registered Sex Offender (RSO)?`,
      application,
      'offence-and-behaviour-summary',
      'registered-sex-offender',
      paths.applications.show({
        id: application.id,
      }),
    )
  }

  completeForm() {
    this.checkRadioButtonFromPageBody('registeredSexOffender')
  }
}
