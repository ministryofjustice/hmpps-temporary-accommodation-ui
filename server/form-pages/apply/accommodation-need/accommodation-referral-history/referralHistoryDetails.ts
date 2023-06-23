import { ApprovedPremisesApplication as Application } from '@approved-premises/api'
import type { TaskListErrors } from '@approved-premises/ui'
import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'

const accommodationTypes = {
  cas1: {
    text: 'Approved Premises',
    detailLabel:
      'Provide details on whether they were offered a place, if they stayed in the accommodation, and what their behaviour was like',
    error: 'You must provide details on previous Approved Premises referrals',
  },
  dtr: {
    text: 'Local authority (duty to refer)',
    error: 'You must provide details on previous local authority (duty to refer) referrals',
  },
  crs: {
    text: 'Commissioned rehabilitative services (CRS) accommodation',
    detailLabel:
      'Provide details on whether they were offered a place, if they stayed in the accommodation, and what their behaviour was like',
    error: 'You must provide details on previous CRS referrals',
  },
  crsWomen: {
    text: "CRS women's accommodation referral",
    error: "You must provide details on previous CRS women's accommodation referrals",
  },
  cas3: {
    text: 'Temporary Accommodation, previously known as CAS3',
    error: 'You must provide details on previous Temporary Accommodation referrals',
  },
} as const

type AccommodationTypes = keyof typeof accommodationTypes
type AccommodationTypesDetail = { [T in AccommodationTypes as `${T}Detail`]: string }

type ReferralHistoryDetailsBody = {
  accommodationTypes: Array<AccommodationTypes>
} & AccommodationTypesDetail

@Page({
  name: 'referral-history-details',
  bodyProperties: ['accommodationTypes', ...Object.keys(accommodationTypes).map(key => `${key}Detail`)],
})
export default class ReferralHistoryDetails implements TasklistPage {
  title = 'What type of accommodation was the referral for?'

  constructor(readonly body: Partial<ReferralHistoryDetailsBody>, readonly application: Application) {}

  response() {
    const response = {}

    this.body.accommodationTypes?.forEach(accommodationType => {
      response[accommodationTypes[accommodationType].text] = this.body[`${accommodationType}Detail`]
    })

    return response
  }

  previous() {
    return 'referrals-previously-submitted'
  }

  next() {
    return ''
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.accommodationTypes?.length) {
      errors.accommodationTypes = 'You must specify what type of accommodation the referral was for'
    }

    this.body.accommodationTypes?.forEach(accommodationType => {
      const detailKey = `${accommodationType}Detail`
      if (!this.body[detailKey]) {
        errors[detailKey] = accommodationTypes[accommodationType].error
      }
    })

    return errors
  }

  items() {
    return Object.keys(accommodationTypes).map(key => {
      return {
        value: key,
        text: accommodationTypes[key].text,
        detailLabel: accommodationTypes[key].detailLabel,
      }
    })
  }
}
