import { ApprovedPremisesApplication, ArrayOfOASysOffenceDetailsQuestions } from '@approved-premises/api'
import paths from '../../../server/paths/apply'

import ApplyPage from './applyPage'

export default class OffenceDetails extends ApplyPage {
  constructor(
    application: ApprovedPremisesApplication,
    private readonly offenceDetailSummaries: ArrayOfOASysOffenceDetailsQuestions,
  ) {
    super(
      'Edit risk information',
      application,
      'oasys-import',
      'offence-details',
      paths.applications.pages.show({ id: application.id, task: 'oasys-import', page: 'rosh-summary' }),
    )
  }

  completeForm() {
    this.completeOasysImportQuestions(this.offenceDetailSummaries, 'offenceDetailsAnswers')
  }
}
