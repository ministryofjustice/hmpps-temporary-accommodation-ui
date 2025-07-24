import { TemporaryAccommodationApplication as Application } from '@approved-premises/api'
import type { ObjectWithDateParts, TaskListErrors } from '@approved-premises/ui'
import { Page } from '../../../utils/decorators'
import errorLookupData from '../../../../i18n/en/errors.json'
import labelLookupData from '../../../../i18n/en/application/releaseType.json'

import { DateFormats, dateAndTimeInputsAreValidDates, dateIsBlank } from '../../../../utils/dateUtils'
import TasklistPage from '../../../tasklistPage'
import { dateBodyProperties } from '../../../utils'

const optionsToExclude = ['ecsl']

export const releaseTypes: Record<string, { text: string; abbr: string }> = {
  fourteenDayFixedTermRecall: {
    text: '14-day fixed-term recall release licence',
    abbr: '14-day fixed-term recall',
  },
  twentyEightDayFixedTermRecall: {
    text: '28-day fixed-term recall release licence',
    abbr: '28-day fixed-term recall',
  },
  standardRecall: {
    text: 'Standard recall release licence',
    abbr: 'Standard recall',
  },
  crdLicence: {
    text: 'Conditional release date (CRD) licence',
    abbr: 'CRD licence',
  },
  indeterminatePublicProtectionRarr: {
    text: 'Indeterminate Public Protection RARR release licence',
    abbr: 'Indeterminate Public Protection RARR',
  },
  nonPresumptiveRarr: {
    text: 'Non-Presumptive Risk Assessed Recall Review (NP-RARR) release licence',
    abbr: 'Non-Presumptive RARR',
  },
  presumptiveRarr: {
    text: 'Presumptive RARR release licence',
    abbr: 'Presumptive RARR',
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

export type ErrorLookups = {
  generic: {
    application: {
      releaseType: {
        empty: string
        maximumSelected: string
        oneRecallOrRARR: string
        invalidParoleSelection: string
        invalidCRDSelection: string
      }
    }
  }
  application: {
    releaseType: Record<
      ReleaseTypeKey,
      {
        dates: {
          emptyStartDate: string
          emptyEndDate: string
          invalidStartDate: string
          invalidEndDate: string
          beforeStartDate: string
        }
      }
    >
  }
}

export const errorLookups: ErrorLookups = {
  application: {
    releaseType: errorLookupData.application.releaseType,
  },
  generic: {
    application: {
      releaseType: errorLookupData.generic.application.releaseTypes,
    },
  },
}

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

  recallLicenceTypes = [
    'fourteenDayFixedTermRecall',
    'twentyEightDayFixedTermRecall',
    'standardRecall',
    'nonPresumptiveRarr',
    'presumptiveRarr',
    'indeterminatePublicProtectionRarr',
  ]

  constructor(
    private _body: Partial<ReleaseTypeBody>,
    readonly application: Application,
  ) {}

  public set body(value: Partial<ReleaseTypeBody>) {
    this._body = {
      releaseTypes: value.releaseTypes,
      ...value.releaseTypes?.reduce((properties, key: ReleaseTypeKey) => {
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
    const selectedTypes = this.body.releaseTypes?.filter(
      key => Boolean(releaseTypes[key]) || optionsToExclude.includes(key),
    )
    const response = {
      [this.title]: selectedTypes?.map(key => releaseTypes[key].text).join('\n'),
    }

    selectedTypes?.forEach((key: ReleaseTypeKey) => {
      const releaseTypeDateLabel = this.recallLicenceTypes.includes(key) ? 'Licence' : releaseTypes[key].abbr

      response[`${releaseTypeDateLabel} start date`] = DateFormats.isoDateToUIDate(this.body[`${key}StartDate`])
      response[`${releaseTypeDateLabel} end date`] = DateFormats.isoDateToUIDate(this.body[`${key}EndDate`])
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

    if (!this.body.releaseTypes?.length || this.checkForOldReleaseTypes()) {
      errors.releaseTypes = errorLookups.generic.application.releaseType.empty
    } else if (this.body.releaseTypes.length > 2) {
      errors.releaseTypes = errorLookups.generic.application.releaseType.maximumSelected
    } else if (this.checkOnlyOneLicenceTypeIsSelected()) {
      errors.releaseTypes = errorLookups.generic.application.releaseType.oneRecallOrRARR
    } else if (this.body.releaseTypes.includes('parole') && this.body.releaseTypes.includes('pss')) {
      errors.releaseTypes = errorLookups.generic.application.releaseType.invalidParoleSelection
    } else if (this.checkCRDSelection()) {
      errors.releaseTypes = errorLookups.generic.application.releaseType.invalidCRDSelection
    } else {
      this.body.releaseTypes.forEach((key: ReleaseTypeKey) => {
        if (!errorLookups.application.releaseType[key]) return

        if (dateIsBlank(this.body, `${key}StartDate`)) {
          errors[`${key}StartDate`] = errorLookups.application.releaseType[key as ReleaseTypeKey].dates.emptyStartDate
        } else if (!dateAndTimeInputsAreValidDates(this.body, `${key}StartDate`)) {
          errors[`${key}StartDate`] = errorLookups.application.releaseType[key as ReleaseTypeKey].dates.invalidStartDate
        }

        if (dateIsBlank(this.body, `${key}EndDate`)) {
          errors[`${key}EndDate`] = errorLookups.application.releaseType[key as ReleaseTypeKey].dates.emptyEndDate
        } else if (!dateAndTimeInputsAreValidDates(this.body, `${key}EndDate`)) {
          errors[`${key}EndDate`] = errorLookups.application.releaseType[key as ReleaseTypeKey].dates.invalidEndDate
        }

        if (
          !errors[`${key}StartDate`] &&
          !errors[`${key}EndDate`] &&
          DateFormats.isoToDateObj(this.body[`${key}EndDate`]) <= DateFormats.isoToDateObj(this.body[`${key}StartDate`])
        ) {
          errors[`${key}EndDate`] = errorLookups.application.releaseType[key as ReleaseTypeKey].dates.beforeStartDate
        }
      })
    }

    return errors as TaskListErrors<this>
  }

  dateLabels(releaseType: ReleaseType) {
    return labelLookupData.labels[`${releaseType}StartDate` as never]
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

    return releaseTypeOptions.filter(
      item =>
        !optionsToExclude.includes(item.value) ||
        this._body.releaseTypes?.filter(type => optionsToExclude.includes(type)).length > 0,
    )
  }

  checkForOldReleaseTypes() {
    const validReleaseTypeKeys = [...Object.keys(releaseTypes), ...optionsToExclude]
    const invalidReleaseTypes = this.body.releaseTypes.filter(
      releaseType => releaseType !== undefined && !validReleaseTypeKeys.includes(releaseType),
    )
    return invalidReleaseTypes.length > 0
  }

  checkOnlyOneLicenceTypeIsSelected() {
    const licenceMatches = this.body.releaseTypes.filter(release => this.recallLicenceTypes.includes(release))

    // Check if there is more than one match from licenceTypes
    return licenceMatches.length > 1
  }

  checkCRDSelection() {
    const selected = this.body.releaseTypes
    if (!selected?.includes('crdLicence')) return false

    // Check if any recallLicenceTypes or parole are also selected
    return selected.some(type => this.recallLicenceTypes.includes(type) || type === 'parole')
  }
}
