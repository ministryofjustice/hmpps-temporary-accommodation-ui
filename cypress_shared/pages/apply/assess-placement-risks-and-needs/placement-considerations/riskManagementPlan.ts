import type { TemporaryAccommodationApplication } from '@approved-premises/api'
import { ArrayOfOASysRiskManagementPlanQuestions } from '../../../../../server/@types/shared'
import paths from '../../../../../server/paths/apply'
import ApplyPage from '../../applyPage'

export default class RiskManagementPlanPage extends ApplyPage {
  constructor(
    application: TemporaryAccommodationApplication,
    private readonly riskRiskManagementPlanSummaries: ArrayOfOASysRiskManagementPlanQuestions,
    private readonly oasysMissing: boolean,
  ) {
    super(
      'Placement considerations',
      application,
      'placement-considerations',
      'risk-management-plan',
      paths.applications.pages.show({
        id: application.id,
        task: 'placement-considerations',
        page: 'rosh-level',
      }),
    )
  }

  completeForm() {
    this.completeOasysImportQuestions(this.riskRiskManagementPlanSummaries, 'riskManagementAnswers', this.oasysMissing)
  }
}
