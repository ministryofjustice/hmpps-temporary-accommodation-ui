import { TemporaryAccommodationApplication as Application } from '@approved-premises/api'
import paths from '../../../../../server/paths/apply'
import ApplyPage from '../../applyPage'

export default class ApprovalsForSpecificRisksPage extends ApplyPage {
  constructor(application: Application) {
    super(
      'Approvals for specific risks',
      application,
      'approvals-for-specific-risks',
      'approvals-for-specific-risks',
      paths.applications.show({ id: application.id }),
    )
  }

  completeForm() {
    this.completeYesNoInputWithDetailFromPageBody('approvals')
  }
}
