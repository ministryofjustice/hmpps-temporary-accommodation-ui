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
    )
  }

  completeForm() {
    this.completeOasysImportQuestions(this.roshSummary, 'roshAnswers')
  }
}
