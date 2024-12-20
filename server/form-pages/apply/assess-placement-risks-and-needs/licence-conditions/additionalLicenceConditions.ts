import { TemporaryAccommodationApplication as Application } from '@approved-premises/api'
import type { PageResponse, TaskListErrors } from '@approved-premises/ui'
import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'

type AdditionalLicenceConditionField = {
  text: string
  error: string
  detailLabel?: string
  detailHint?: string
}

const conditions: Record<string, AdditionalLicenceConditionField> = {
  alcoholMonitoring: {
    text: 'Alcohol monitoring',
    error: 'You must provide details about alcohol monitoring',
  },
  civilOrders: {
    text: 'Civil orders (e.g. SHPT), restraining orders, criminal behaviour orders',
    error:
      'You must provide details about any civil orders (e.g. SHPT), restraining orders, or criminal behaviour orders',
  },
  curfew: {
    text: 'Curfew',
    error: 'You must provide details about curfew conditions',
  },
  drugTesting: {
    text: 'Drug testing',
    error: 'You must provide details about drug testing conditions',
  },
  engagementWithServices: {
    text: 'Engagement with services',
    error: 'You must provide details about conditions to engage with services',
  },
  exclusionZone: {
    text: 'Exclusion zone',
    detailLabel: 'Provide details about the exclusion zone',
    detailHint: 'You must ensure that the exclusion zone map is on NDelius.',
    error: 'You must provide details about the exclusion zone',
  },
  initmateRelationships: {
    text: 'Inform community probation practitioner of developing intimate relationships',
    error: 'You must provide details about conditions on intimate relationships',
  },
  noContactWithChildren: {
    text: 'No contact with children',
    error: 'You must provide details about conditions on child contact',
  },
  nonAssociation: {
    text: 'Non association',
    error: 'You must provide details about conditions on non association',
  },
  nonContact: {
    text: 'Non contact',
    error: 'You must provide details about conditions on non contact',
  },
  programmes: {
    text: 'Participate or co-operate with programmes or activities',
    error: 'You must provide details about conditions on programmes or activities',
  },
  residencyRestriction: {
    text: 'Restriction of residency',
    error: 'You must provide details about residency restrictions',
  },
  other: {
    text: 'Other conditions (relevant to accommodation)',
    error: 'You must provide details about other conditions',
  },
} as const

type Conditions = keyof typeof conditions
type ConditionsDetail = { [T in Conditions as `${T}Detail`]: string }

type AdditionalLicenceConditionsBody = {
  conditions: Array<Conditions>
} & ConditionsDetail

@Page({
  name: 'additional-licence-conditions',
  bodyProperties: ['conditions', ...Object.keys(conditions).map(key => `${key}Detail`)],
})
export default class AdditionalLicenceConditions implements TasklistPage {
  title = 'Additional licence conditions'

  htmlDocumentTitle = this.title

  constructor(
    readonly body: Partial<AdditionalLicenceConditionsBody>,
    readonly application: Application,
  ) {}

  response() {
    const response: PageResponse = {}

    this.body.conditions?.forEach(condition => {
      response[conditions[condition].text] = this.body[`${condition}Detail`]
    })

    return response
  }

  previous() {
    return 'dashboard'
  }

  next() {
    return ''
  }

  errors() {
    const errors: Record<string, string> = {}

    this.body.conditions?.forEach(condition => {
      const detailKey = `${condition}Detail` as keyof ConditionsDetail
      if (!this.body[detailKey]) {
        errors[detailKey] = conditions[condition].error
      }
    })

    return errors as TaskListErrors<this>
  }

  items() {
    return Object.entries(conditions).map(([key, value]) => {
      return {
        value: key,
        text: value.text,
        detailLabel: value.detailLabel,
        detailHint: value.detailHint,
      }
    })
  }
}
