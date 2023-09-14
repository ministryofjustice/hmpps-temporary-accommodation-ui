import type { Adjudication, ApprovedPremisesApplication } from '@approved-premises/api'
import type { DataServices, PageResponse } from '@approved-premises/ui'
import { CallConfig } from '../../../../data/restClient'
import { DateFormats } from '../../../../utils/dateUtils'
import { sentenceCase } from '../../../../utils/utils'
import TasklistPage from '../../../tasklistPage'
import { PageBodyAdjudication, mapAdjudicationsForPageBody } from '../../../utils'
import { Page } from '../../../utils/decorators'

type AdjudicationsBody = {
  adjudications: Array<PageBodyAdjudication>
}

export const adjudicationResponse = (adjudication: Adjudication) => {
  return {
    'Adjudication number': adjudication.id,
    'Report date and time': DateFormats.isoDateTimeToUIDateTime(adjudication.reportedAt),
    Establishment: adjudication.establishment,
    'Offence description': adjudication.offenceDescription,
    Finding: sentenceCase(adjudication.finding),
  }
}

@Page({
  name: 'adjudications',
  bodyProperties: ['adjudications'],
})
export default class Adjudications implements TasklistPage {
  title = 'Adjudications'

  htmlDocumentTitle = this.title

  importDate: string

  constructor(
    readonly body: Partial<AdjudicationsBody>,
    readonly application: ApprovedPremisesApplication,
  ) {}

  static async initialize(
    _: Record<string, unknown>,
    application: ApprovedPremisesApplication,
    callConfig: CallConfig,
    dataServices: DataServices,
  ) {
    const adjudications = await dataServices.personService.getAdjudications(callConfig, application.person.crn)

    const page = new Adjudications({ adjudications: mapAdjudicationsForPageBody(adjudications) }, application)

    page.importDate = DateFormats.dateObjToIsoDate(new Date())

    return page
  }

  previous() {
    return 'dashboard'
  }

  next() {
    return 'acct-alerts'
  }

  response() {
    const response: PageResponse = {}

    response.Adjudications = this.body.adjudications.length
      ? this.body.adjudications.map(adjudicationResponse)
      : `No adjudication information available for the person at the time of referral`

    return response
  }

  errors() {
    const errors = {}

    return errors
  }
}
