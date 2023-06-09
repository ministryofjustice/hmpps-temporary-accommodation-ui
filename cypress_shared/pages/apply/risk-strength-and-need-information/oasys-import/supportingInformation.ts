import { ArrayOfOASysSupportingInformationQuestions, TemporaryAccommodationApplication } from '@approved-premises/api'
import paths from '../../../../../server/paths/apply'

import ApplyPage from '../../applyPage'

export default class SupportingInformation extends ApplyPage {
  constructor(
    application: TemporaryAccommodationApplication,
    private readonly supportingInformationSummaries: ArrayOfOASysSupportingInformationQuestions,
  ) {
    super(
      'Edit risk information',
      application,
      'oasys-import',
      'offence-details',
      paths.applications.pages.show({ id: application.id, task: 'oasys-import', page: 'offence-details' }),
    )
  }

  completeForm() {
    this.completeOasysImportQuestions(this.supportingInformationSummaries, 'supportingInformationAnswers')
  }
}
