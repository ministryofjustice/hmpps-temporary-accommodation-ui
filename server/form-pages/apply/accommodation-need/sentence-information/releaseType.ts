import { TemporaryAccommodationApplication as Application } from '@approved-premises/api'
import type { ObjectWithDateParts, TaskListErrors } from '@approved-premises/ui'
import { Page } from '../../../utils/decorators'

import { DateFormats, dateAndTimeInputsAreValidDates, dateIsBlank } from '../../../../utils/dateUtils'
import TasklistPage from '../../../tasklistPage'
import { dateBodyProperties } from '../../../utils'

export const releaseTypes: Record<string, { text: string; abbr: string }> = {
  crdLicence: {
    text: 'Conditional release date (CRD) licence',
    abbr: 'CRD licence',
  },
  ecsl: {
    text: 'End of custody supervised licence (ECSL)',
    abbr: 'ECSL',
  },
  fixedTermRecall: {
    text: 'Licence following fixed-term recall',
    abbr: 'Fixed-term recall',
  },
  standardRecall: {
    text: 'Licence following standard recall',
    abbr: 'Standard recall',
  },
  nonPresumptiveRarr: {
    text: 'Licence following Non-Presumptive Risk Assessed Recall Review (NP-RARR)',
    abbr: 'Non-Presumptive RARR',
  },
  presumptiveRarr: {
    text: 'Licence following Presumptive RARR',
    abbr: 'Presumptive RARR',
  },
  indeterminatePublicProtectionRarr: {
    text: 'Licence following Indeterminate Public Protection RARR',
    abbr: 'Indeterminate Public Protection RARR',
  },
  parole: {
    text: 'Parole',
    abbr: 'Parole',
  },
  pss: {
    text: 'Post sentence supervision (PSS)',
    abbr: 'PSS',
  },
}

export type ReleaseTypeKey = keyof typeof releaseTypes

export type ReleaseTypeBody = {
  releaseTypes: Array<ReleaseTypeKey>
} & ObjectWithDateParts<`${ReleaseTypeKey}StartDate`> &
  ObjectWithDateParts<`${ReleaseTypeKey}EndDate`>

@Page({
  name: 'release-type',
  bodyProperties: [
    'releaseTypes',
    ...Object.keys(releaseTypes).reduce(
      (properties, key: ReleaseTypeKey) => [
        ...properties,
        ...dateBodyProperties(`${key}StartDate`),
        ...dateBodyProperties(`${key}EndDate`),
      ],
      [],
    ),
  ],
})
export default class ReleaseType implements TasklistPage {
  title = 'What is the release type?'

  htmlDocumentTitle = this.title

  constructor(
    private _body: Partial<ReleaseTypeBody>,
    readonly application: Application,
  ) {}

  public set body(value: Partial<ReleaseTypeBody>) {
    const selectedTypes = value.releaseTypes?.filter(key => Boolean(releaseTypes[key]))
    this._body = {
      releaseTypes: selectedTypes,
      ...selectedTypes?.reduce((properties, key: ReleaseTypeKey) => {
        return {
          ...properties,
          ...DateFormats.dateAndTimeInputsToIsoString(value, `${key}StartDate`),
          ...DateFormats.dateAndTimeInputsToIsoString(value, `${key}EndDate`),
        }
      }, {}),
    } as ReleaseTypeBody
  }

  public get body(): Partial<ReleaseTypeBody> {
    return this._body
  }

  response() {
    const response = {
      [this.title]: this.body.releaseTypes?.map(key => releaseTypes[key].abbr).join('\n'),
    }

    this.body.releaseTypes?.forEach((key: ReleaseTypeKey) => {
      response[`${releaseTypes[key].abbr} start date`] = DateFormats.isoDateToUIDate(this.body[`${key}StartDate`])
      response[`${releaseTypes[key].abbr} end date`] = DateFormats.isoDateToUIDate(this.body[`${key}EndDate`])
    })

    return response
  }

  previous() {
    return 'sentence-expiry'
  }

  next() {
    return ''
  }

  errors() {
    const errors: Record<string, unknown> = {}

    if (!this.body.releaseTypes?.length) {
      errors.releaseTypes = 'You must specify the release types'
    } else if (
      this.body.releaseTypes.includes('fixedTermRecall') &&
      this.body.releaseTypes.includes('standardRecall')
    ) {
      errors.releaseTypes = 'Select one type of recall licence'
    } else if (
      this.body.releaseTypes.includes('parole') &&
      (this.body.releaseTypes.includes('crdLicence') || this.body.releaseTypes.includes('pss'))
    ) {
      errors.releaseTypes = 'Parole cannot be selected alongside the CRD licence or PSS'
    } else {
      this.body.releaseTypes.forEach((key: ReleaseTypeKey) => {
        if (dateIsBlank(this.body, `${key}StartDate`)) {
          errors[`${key}StartDate`] = `You must specify the ${releaseTypes[key].abbr} start date`
        } else if (!dateAndTimeInputsAreValidDates(this.body, `${key}StartDate`)) {
          errors[`${key}StartDate`] = `You must specify a valid ${releaseTypes[key].abbr} start date`
        }

        if (dateIsBlank(this.body, `${key}EndDate`)) {
          errors[`${key}EndDate`] = `You must specify the ${releaseTypes[key].abbr} end date`
        } else if (!dateAndTimeInputsAreValidDates(this.body, `${key}EndDate`)) {
          errors[`${key}EndDate`] = `You must specify a valid ${releaseTypes[key].abbr} end date`
        }
      })
    }

    return errors as TaskListErrors<this>
  }

  currentReleaseTypeOptions() {
    const releaseTypeOptions = Object.entries(releaseTypes).reduce(
      (options, [key, releaseType]) => [
        ...options,
        {
          name: releaseType.text,
          value: key,
        },
      ],
      [],
    )
    const optionsToExclude = ['ecsl']

    return releaseTypeOptions.filter(
      item =>
        !optionsToExclude.includes(item.value) ||
        this._body.releaseTypes?.filter(type => optionsToExclude.includes(type)).length > 0,
    )
  }
}
