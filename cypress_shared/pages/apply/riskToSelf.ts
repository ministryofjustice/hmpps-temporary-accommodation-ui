import { ApprovedPremisesApplication, ArrayOfOASysRiskToSelfQuestions } from '@approved-premises/api'
import paths from '../../../server/paths/apply'

import ApplyPage from './applyPage'

export default class RiskToSelf extends ApplyPage {
  constructor(
    application: ApprovedPremisesApplication,
    private readonly riskToSelfummaries: ArrayOfOASysRiskToSelfQuestions,
  ) {
    super(
      'Edit risk information',
      application,
      'oasys-import',
      'offence-details',
      paths.applications.pages.show({ id: application.id, task: 'oasys-import', page: 'risk-management-plan' }),
    )
  }

  completeForm() {
    this.completeOasysImportQuestions(this.riskToSelfummaries, 'riskToSelfAnswers')
  }
}
