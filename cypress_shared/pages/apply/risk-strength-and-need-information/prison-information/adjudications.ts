import type { Adjudication, TemporaryAccommodationApplication } from '@approved-premises/api'
import paths from '../../../../../server/paths/apply'
import { DateFormats } from '../../../../../server/utils/dateUtils'
import { sentenceCase } from '../../../../../server/utils/utils'
import ApplyPage from '../../applyPage'

export default class AdditionalLicenceConditionsPage extends ApplyPage {
  constructor(application: TemporaryAccommodationApplication) {
    super(
      'Prison information',
      application,
      'prison-information',
      'adjudications',
      paths.applications.show({ id: application.id }),
    )
  }

  shouldDisplayAdjudications(adjudications: Array<Adjudication>) {
    adjudications.forEach(adjudication => {
      cy.get('tr')
        .contains(adjudication.id)
        .parent()
        .within(() => {
          cy.get('td').eq(1).contains(DateFormats.isoDateTimeToUIDateTime(adjudication.reportedAt))
          cy.get('td').eq(2).contains(adjudication.establishment)
          cy.get('td').eq(3).contains(adjudication.offenceDescription)
          cy.get('td')
            .eq(4)
            .contains(sentenceCase(adjudication?.finding || ''))
        })
    })
  }
}
