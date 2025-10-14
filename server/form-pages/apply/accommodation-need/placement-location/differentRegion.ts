import { TemporaryAccommodationApplication as Application, ProbationRegion } from '@approved-premises/api'
import type { DataServices, PageResponse, TaskListErrors } from '@approved-premises/ui'
import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'
import { CallConfig } from '../../../../data/restClient'
import { personName } from '../../../../utils/personUtils'

export type DifferentRegionBody = {
  regionId: ProbationRegion['id']
  regionName: ProbationRegion['name']
  currentRegionId?: ProbationRegion['id']
  currentRegionName?: ProbationRegion['name']
}

type RegionOption = { value: string; text: string; checked?: boolean }
type DividerOption = { divider: string }
type RegionOrDivider = RegionOption | DividerOption

@Page({ name: 'different-region', bodyProperties: ['regionId', 'regionName', 'currentRegionId', 'currentRegionName'] })
export default class DifferentRegion implements TasklistPage {
  title: string

  htmlDocumentTitle = 'Which region should the person be placed in?'

  regionName: string

  private _body: Partial<DifferentRegionBody>

  constructor(
    _body: Partial<DifferentRegionBody>,
    readonly application: Application,
    readonly regions?: Array<ProbationRegion>,
  ) {
    this._body = _body
    const name = personName(application.person)
    this.title = `Which region should ${name} be placed in?`
  }

  static async initialize(
    body: DifferentRegionBody,
    application: Application,
    callConfig: CallConfig,
    dataServices: DataServices,
  ) {
    const regions = await dataServices.referenceDataService.getProbationRegions(callConfig)
    const regionName = callConfig.probationRegion.name
    body.currentRegionName = regionName
    body.currentRegionId = callConfig.probationRegion.id

    return new DifferentRegion(body, application, regions)
  }

  set body(value) {
    this._body = {
      ...this.body,
      regionId:
        value.regionId ||
        (this.body.currentRegionName === 'National'
          ? this.application.data?.['placement-location']?.['different-region']?.regionId
          : null),
      regionName: value.regionName || this.regions?.find(region => region.id === value.regionId)?.name || '',
    }

    const previousRegionId = this.application.data?.['placement-location']?.['different-region']?.regionId

    if (previousRegionId && previousRegionId !== value.regionId && this.body.currentRegionName !== 'National') {
      this.application.data['placement-location']['placement-pdu'] = {}
    }
  }

  get body() {
    return this._body
  }

  response() {
    const translatedResponse: PageResponse = {
      'Which region should the person be placed in?': this.body.regionName,
    }

    return translatedResponse
  }

  previous() {
    return 'alternative-region'
  }

  next() {
    if (this.body?.regionId === this.body.currentRegionId) {
      return 'alternative-pdu'
    }
    return 'placement-pdu'
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.regionId) {
      errors.regionId = `Select the region ${personName(this.application.person)} should be placed in`
    }

    return errors
  }

  getAllRegions() {
    const regionOptions: RegionOrDivider[] = (this.regions ?? [])
      .filter(region => region.id !== this.body.currentRegionId && region.name !== 'National')
      .map(region => ({
        value: region.id,
        text: region.name,
        checked: this.body.regionId === region.id || false,
      }))

    if (this.body.currentRegionId && this.body.currentRegionName && this.body.currentRegionName !== 'National') {
      regionOptions.push(
        { divider: 'or' },
        {
          value: this.body.currentRegionId,
          text: `${this.body.currentRegionName} (your region)`,
          checked: this.body.regionId === this.body.currentRegionId || false,
        },
      )
    }

    return regionOptions
  }
}
