import type { DataServices, PersonRisksUI } from '@approved-premises/ui'

import type {
  ArrayOfOASysSupportingInformationQuestions,
  OASysSections,
  TemporaryAccommodationApplication,
} from '@approved-premises/api'

import TasklistPage from '../../../tasklistPage'

import { Page } from '../../../utils/decorators'
import {
  fetchOptionalOasysSections,
  oasysImportReponse,
  sortOasysImportSummaries,
} from '../../../../utils/oasysImportUtils'
import { mapApiPersonRisksForUi } from '../../../../utils/utils'
import { CallConfig } from '../../../../data/restClient'

type SupportingInformationBody = {
  supportingInformationAnswers: Array<string> | Record<string, string>
  supportingInformationSummaries: ArrayOfOASysSupportingInformationQuestions
}

@Page({
  name: 'supporting-information',
  bodyProperties: ['supportingInformationAnswers', 'supportingInformationSummaries'],
})
export default class SupportingInformation implements TasklistPage {
  title = 'Edit risk information'

  supportingInformationSummaries: SupportingInformationBody['supportingInformationSummaries']

  supportingInformationAnswers: SupportingInformationBody['supportingInformationAnswers']

  oasysCompleted: string

  risks: PersonRisksUI

  constructor(public body: Partial<SupportingInformationBody>) {}

  static async initialize(
    body: Record<string, unknown>,
    application: TemporaryAccommodationApplication,
    callConfig: CallConfig,
    dataServices: DataServices,
  ) {
    const oasysSections: OASysSections = await dataServices.personService.getOasysSections(
      callConfig,
      application.person.crn,
      fetchOptionalOasysSections(application),
    )

    const supportingInformation = sortOasysImportSummaries(oasysSections.supportingInformation)

    body.supportingInformationSummaries = supportingInformation

    const page = new SupportingInformation(body)
    page.supportingInformationSummaries = supportingInformation
    page.oasysCompleted = oasysSections?.dateCompleted || oasysSections?.dateStarted
    page.risks = mapApiPersonRisksForUi(application.risks)

    return page
  }

  previous() {
    return 'offence-details'
  }

  next() {
    return 'risk-management-plan'
  }

  response() {
    return oasysImportReponse(this.body.supportingInformationAnswers, this.body.supportingInformationSummaries)
  }

  errors() {
    return {}
  }
}
