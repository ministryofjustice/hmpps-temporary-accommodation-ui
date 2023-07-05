import { ApprovedPremisesApplication as Application } from '@approved-premises/api'
import type { TaskListErrors } from '@approved-premises/ui'
import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'

const accommodationTypes = {
  cas1: {
    text: 'Approved Premises (AP or CAS1)',
  },
  cas2: {
    text: 'Bail Accommodation and Support Service (BASS or CAS2)',
  },
  cas3: {
    text: 'Temporary Accommodation, previously known as CAS3',
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
  title: string

  constructor(readonly body: Partial<ReferralHistoryDetailsBody>, readonly application: Application) {
    const { name } = application.person

    this.title = `What type of accommodation did ${name} stay at?`
  }

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
      const { name } = this.application.person

      errors.accommodationTypes = `You must specify what type of accommodation ${name} stayed at`
    }

    this.body.accommodationTypes?.forEach(accommodationType => {
      const detailKey = `${accommodationType}Detail`
      if (!this.body[detailKey]) {
        errors[detailKey] = 'You must provide details about their behaviour during their stay'
      }
    })

    return errors
  }

  items() {
    return Object.keys(accommodationTypes).map(key => {
      return {
        value: key,
        text: accommodationTypes[key].text,
      }
    })
  }
}
