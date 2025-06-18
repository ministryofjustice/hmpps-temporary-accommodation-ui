import { TemporaryAccommodationApplication as Application, ProbationRegion } from '@approved-premises/api'
import type { DataServices, PageResponse, TaskListErrors, YesOrNo } from '@approved-premises/ui'
import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'
import { sentenceCase } from '../../../../utils/utils'
import { CallConfig } from '../../../../data/restClient'

export type AlternativePduBody = {
  regionId: ProbationRegion['id']
  regionName: ProbationRegion['name']
}

@Page({ name: 'different-region', bodyProperties: ['regionId', 'regionName'] })
export default class DifferentRegion implements TasklistPage {
  title = 'Which region should the person be placed in?'

  htmlDocumentTitle = this.title

  constructor(
    private _body: Partial<AlternativePduBody>,
    private application: Application,
    readonly regions?: Array<ProbationRegion>,
  ) {}

  static async initialize(
    body: AlternativePduBody,
    application: Application,
    callConfig: CallConfig,
    dataServices: DataServices,
  ) {
    const regions = await dataServices.referenceDataService.getProbationRegions(callConfig)
    return new DifferentRegion(body, application, regions)
  }

  set body(value) {
    console.log("BODY", this.body)
    this._body = {
      regionId: value.regionId,
      regionName: value.regionName || this.regions?.find(region => region.id === value.regionId)?.name || '',
    }
    const previousRegionId = this.application.data?.['placement-location']['different-region']?.regionId
    console.log("PREVIOUS REGION ID", previousRegionId)
    console.log("CURRENT REGION ID", value.regionId)
    if (previousRegionId && previousRegionId !== value.regionId) {
      this.application.data['placement-location']['placement-pdu'] = {}
    }
  }

  get body() {
    return this._body
  }

  response() {
    const translatedResponse: PageResponse = {
      'Which region should the person be placed in?': sentenceCase(this.body.regionName),
    }

    return translatedResponse
  }

  previous() {
    return ''
  }

  next() {
    return 'placement-pdu'
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    // if (!this.body.alternativeRegion) {
    //   errors.alternativePdu = 'You must specify if placement is required in an alternative PDU??????'
    // } else if (this.body.alternativeRegion === 'yes' && !this.body.pduId) {
    //   errors.pduId = 'You must select a PDU'
    // }

    return errors
  }

  getAllRegions() {
    return [
      ...this.regions.map(region => ({
        value: region.id,
        text: region.name,
        checked: this.body.regionId === region.id || undefined,
      })),
      {
        divider: 'or',
      },
      {
        value: '',
        text: 'East of England (your region)',
        checked: this.body.regionId === '' || undefined,
      },
    ]
  }
}
