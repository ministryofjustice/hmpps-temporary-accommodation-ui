import { TemporaryAccommodationApplication as Application, OASysQuestion } from '@approved-premises/api'
import type { DataServices, OasysPage, PersonRisksUI } from '@approved-premises/ui'
import { Page } from '../../../utils/decorators'

import { CallConfig } from '../../../../data/restClient'
import { getOasysSections, oasysImportReponse, validateOasysEntries } from '../../../../utils/oasysImportUtils'

export type RiskManagementPlanBody = {
  version: string
  riskManagementAnswers: Record<string, string>
  riskManagementSummaries: Array<OASysQuestion>
  oasysImported: string
  oasysCompleted: string
}

@Page({
  name: 'risk-management-plan',
  bodyProperties: ['version', 'riskManagementAnswers', 'riskManagementSummaries', 'oasysImported', 'oasysCompleted'],
})
export default class RiskManagementPlan implements OasysPage {
  riskManagementSummaries: RiskManagementPlanBody['riskManagementSummaries']

  title = 'Risk management plan'

  htmlDocumentTitle = this.title

  risks: PersonRisksUI

  oasysSuccess: boolean

  latestVersion = '2'

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
    if (this.body.version !== this.latestVersion) {
      return {
        version: 'You must complete the latest version of this page',
      }
    }

    return validateOasysEntries(this.body, 'riskManagementSummaries', 'riskManagementAnswers')
  }
}
