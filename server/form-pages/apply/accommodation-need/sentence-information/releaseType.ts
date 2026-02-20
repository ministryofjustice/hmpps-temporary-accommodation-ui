import { TemporaryAccommodationApplication as Application } from '@approved-premises/api'
import type { ObjectWithDateParts, TaskListErrors } from '@approved-premises/ui'
import { Page } from '../../../utils/decorators'
import errorLookupData from '../../../../i18n/en/errors.json'
import labelLookupData from '../../../../i18n/en/application/releaseType.json'

import { DateFormats, dateAndTimeInputsAreValidDates, dateIsBlank } from '../../../../utils/dateUtils'
import TasklistPage from '../../../tasklistPage'
import { dateBodyProperties } from '../../../utils'
import { joinStrings } from '../../../../utils/utils'

function getOptionsToExclude(): Array<string> {
  const options = ['ecsl']

  const today = new Date()
  const disablePss = DateFormats.isoToDateObj('2026-04-30')

  if (today >= disablePss) {
    options.push('pss')
  }

  return options
}

const optionsToExclude = getOptionsToExclude()

export const releaseTypes: Record<string, { text: string; abbr: string }> = {
  crdLicence: {
    text: 'Conditional release date (CRD)',
    abbr: 'CRD',
  },
  parole: {
    text: 'Parole',
    abbr: 'Parole',
  },
  fixedTermRecall: {
    text: 'Fixed-term Recall',
    abbr: 'Fixed-term recall',
  },
  standardRecall: {
    text: 'Standard Recall',
    abbr: 'Standard recall',
  },
  riskAssessedRecallReview: {
    text: 'Risk Assessed Recall Review (RARR)',
    abbr: 'RARR',
  },
  indeterminatePublicProtectionRarr: {
    text: 'Indeterminate Public Protection (IPP RARR)',
    abbr: 'IPP RARR',
  },
  pss: {
    text: 'Post Sentence Supervision (PSS)',
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

const invalidReleaseCombinations: Record<ReleaseTypeKey, Array<ReleaseTypeKey>> = {
  standardRecall: ['fixedTermRecall'],
  fixedTermRecall: ['parole', 'standardRecall', 'riskAssessedRecallReview', 'indeterminatePublicProtectionRarr'],
  crdLicence: ['parole', 'indeterminatePublicProtectionRarr'],
  indeterminatePublicProtectionRarr: ['crdLicence', 'fixedTermRecall', 'riskAssessedRecallReview', 'pss'],
  riskAssessedRecallReview: ['fixedTermRecall', 'indeterminatePublicProtectionRarr', 'pss'],
  parole: ['crdLicence', 'fixedTermRecall', 'pss'],
  pss: ['parole', 'riskAssessedRecallReview', 'indeterminatePublicProtectionRarr'],
}

function combineReleases(releases: Array<ReleaseTypeKey>): string {
  const names = releases.map(rel => releaseTypes[rel].abbr)
  return joinStrings(names, 'or')
}

function isReleaseCombinationValid(first: ReleaseTypeKey, second: ReleaseTypeKey): boolean {
  const invalidReleases = invalidReleaseCombinations[first] ?? []
  return !invalidReleases.includes(second)
}

function getReleaseTypeError(key: ReleaseTypeKey): string {
  const firstAbbr = releaseTypes[key].abbr
  const invalidReleases = combineReleases(invalidReleaseCombinations[key])
  return `${firstAbbr} cannot be combined with ${invalidReleases}`
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

  recallLicenceTypes: Array<ReleaseTypeKey> = [
    'fixedTermRecall',
    'standardRecall',
    'riskAssessedRecallReview',
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
    } else if (!isReleaseCombinationValid(this.body.releaseTypes[0], this.body.releaseTypes[1])) {
      errors.releaseTypes = getReleaseTypeError(this.body.releaseTypes[0])
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
}
