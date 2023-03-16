import { ApprovedPremisesApplication, ArrayOfOASysRiskOfSeriousHarmSummaryQuestions } from '@approved-premises/api'
import paths from '../../../server/paths/apply'

import ApplyPage from './applyPage'

export default class RoshSummary extends ApplyPage {
  constructor(
    application: ApprovedPremisesApplication,
    private readonly roshSummary: ArrayOfOASysRiskOfSeriousHarmSummaryQuestions,
  ) {
    super(
      'Edit risk information',
      application,
      'oasys-import',
      'rosh-summary',
      paths.applications.pages.show({ id: application.id, task: 'oasys-import', page: 'optional-oasys-sections' }),
    )
  }

  completeForm() {
    this.completeOasysImportQuestions(this.roshSummary, 'roshAnswers')
  }
}
