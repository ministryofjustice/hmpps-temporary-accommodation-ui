import { TemporaryAccommodationApplication as Application, ProbationRegion } from '@approved-premises/api'
import type { DataServices, PageResponse, TaskListErrors, YesOrNo } from '@approved-premises/ui'
import { Page } from '../../../utils/decorators'
import TasklistPage from '../../../tasklistPage'
import { CallConfig } from '../../../../data/restClient'
import DifferentRegion from './differentRegion'

export type AlternativeRegionBody = {
  alternativeRegion: YesOrNo
  regionName?: ProbationRegion['name']
}

@Page({ name: 'alternative-region', bodyProperties: ['alternativeRegion', 'regionName'] })
export default class AlternativeRegion implements TasklistPage {
  title: string

  htmlDocumentTitle: string

  regionName: string

  constructor(
    private _body: Partial<AlternativeRegionBody>,
    readonly application: Application,
    regionName: string,
  ) {
    this.regionName = regionName
    this.title = `Is the placement for the ${regionName} region?`
    this.htmlDocumentTitle = this.title
  }

  static async initialize(
    body: AlternativeRegionBody,
    application: Application,
    callConfig: CallConfig,
    dataServices: DataServices,
  ) {
    const regionName = callConfig.probationRegion.name

    if (regionName === 'National') {
      application.data = application.data || {}
      application.data['placement-location'] = {
        ...application.data['placement-location'],
        'alternative-region': {
          alternativeRegion: 'no',
          regionName,
        },
      }
      const regions = await dataServices.referenceDataService.getProbationRegions(callConfig)
      return new DifferentRegion(body, application, regions)
    }

    return new AlternativeRegion(body, application, regionName)
  }

  set body(value) {
    this._body = {
      alternativeRegion: value.alternativeRegion,
      regionName: value.regionName ?? this.regionName,
    }
  }

  get body() {
    return this._body
  }

  response() {
    if (this.regionName === 'National') {
      return {}
    }
    const answer = this.body.alternativeRegion === 'yes' ? `Yes, ${this.body.regionName}` : 'No, a different region'
    const translatedResponse: PageResponse = {
      [`Is the placement for the ${this.body.regionName} region?`]: answer,
    }

    return translatedResponse
  }

  previous() {
    return 'dashboard'
  }

  next() {
    if (this.body.regionName === 'National' || this.body.alternativeRegion !== 'yes') {
      return 'different-region'
    }
    return 'alternative-pdu'
  }

  errors() {
    const errors: TaskListErrors<this> = {}
    if (!this.body.alternativeRegion) {
      errors.alternativeRegion = `Select if the placement is for the ${this.body.regionName} region`
    }

    return errors
  }
}
