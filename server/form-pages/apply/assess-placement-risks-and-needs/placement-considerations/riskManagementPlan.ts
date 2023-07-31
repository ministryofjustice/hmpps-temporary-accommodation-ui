import {
  TemporaryAccommodationApplication as Application,
  ArrayOfOASysRiskManagementPlanQuestions,
} from '@approved-premises/api'
import type { DataServices, OasysPage, PersonRisksUI } from '@approved-premises/ui'
import { Page } from '../../../utils/decorators'

import { CallConfig } from '../../../../data/restClient'
import { getOasysSections, oasysImportReponse, validateOasysEntries } from '../../../../utils/oasysImportUtils'

type RiskManagementPlanBody = {
  riskManagementAnswers: Record<string, string>
  riskManagementSummaries: ArrayOfOASysRiskManagementPlanQuestions
  oasysImported: string
  oasysCompleted: string
}

@Page({
  name: 'risk-management-plan',
  bodyProperties: ['riskManagementAnswers', 'riskManagementSummaries', 'oasysImported', 'oasysCompleted'],
})
export default class RiskManagementPlan implements OasysPage {
  riskManagementSummaries: RiskManagementPlanBody['riskManagementSummaries']

  title = 'Risk management plan'

  risks: PersonRisksUI

  oasysSuccess: boolean

  constructor(readonly body: Partial<RiskManagementPlanBody>) {}

  static async initialize(
    body: Record<string, unknown>,
    application: Application,
    callConfig: CallConfig,
    dataServices: DataServices,
  ) {
    return getOasysSections(body, application, callConfig, dataServices, RiskManagementPlan, {
      sectionName: 'riskManagementPlan',
      summaryKey: 'riskManagementSummaries',
      answerKey: 'riskManagementAnswers',
    })
  }

  response() {
    return oasysImportReponse(this.body.riskManagementAnswers, this.body.riskManagementSummaries)
  }

  previous() {
    return 'rosh-level'
  }

  next() {
    return ''
  }

  errors() {
    return validateOasysEntries(this.body, 'riskManagementSummaries', 'riskManagementAnswers')
  }
}
