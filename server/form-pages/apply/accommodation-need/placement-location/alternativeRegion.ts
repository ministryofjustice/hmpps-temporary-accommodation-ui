import { TemporaryAccommodationApplication as Application } from '@approved-premises/api'
import type { DataServices, PageResponse, TaskListErrors, YesOrNo } from '@approved-premises/ui'
import { ProbationRegion } from '@temporary-accommodation-ui/e2e'
import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'
import { sentenceCase } from '../../../../utils/utils'
import { CallConfig } from '../../../../data/restClient'

export type AlternativePduBody = {
  alternativePdu: YesOrNo
  alternativeRegion: YesOrNo
  regionName?: ProbationRegion['name']
}

@Page({ name: 'alternative-region', bodyProperties: ['alternativeRegion', 'regionName'] })
export default class AlternativeRegion implements TasklistPage {
  title = 'Is placement for the East of England?'

  htmlDocumentTitle = this.title

  regionName: string

  constructor(
    private _body: Partial<AlternativePduBody>,
    readonly application: Application,

    regionName: string,
  ) {
    console.debug('AlternativeRegion constructor', regionName)
    this.regionName = regionName
  }

  static async initialize(
    body: AlternativePduBody,
    application: Application,
    callConfig: CallConfig,
    dataServices: DataServices,
  ) {
    console.debug('callconfig', callConfig.probationRegion)

    // return new AlternativeRegion(body, application, pdus)
    const regionName = callConfig.probationRegion.name
    const instance = new AlternativeRegion(body, application, regionName)
    instance.title = `Is placement for the ${regionName} region?`
    instance.htmlDocumentTitle = instance.title
    return instance
  }

  set body(value) {
    console.debug('AlternativeRegion set body', value, value.regionName ?? this.regionName)
    this._body = {
      alternativeRegion: value.alternativeRegion,
      regionName: value.regionName ?? this.regionName,
    }
  }

  get body() {
    return this._body
  }

  response() {
    console.debug('AlternativeRegion response', this.regionName, this.body.regionName)
    const translatedResponse: PageResponse = {
      [`Is placement for the ${this.body.regionName} region?`]: sentenceCase(this.body.alternativeRegion),
    }

    return translatedResponse
  }

  previous() {
    return 'dashboard'
  }

  next() {
    console.log('HERE 1: ', this.body)
    return this.body.alternativeRegion === 'yes' ? 'alternative-pdu' : 'different-region'
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    return errors
  }
}
