import { TemporaryAccommodationApplication as Application } from '@approved-premises/api'
import type { TaskListErrors } from '@approved-premises/ui'
import { Page } from '../../../utils/decorators'

import { personName } from '../../../../utils/personUtils'
import TasklistPage from '../../../tasklistPage'

const accommodationTypes = {
  cas1: {
    text: 'Approved Premises (AP or CAS1)',
  },
  cas2: {
    text: 'CAS2 (formerly Bail Accommodation Support Services)',
  },
  cas3: {
    text: 'Transitional Accommodation (CAS3)',
  },
} as const

type AccommodationTypes = keyof typeof accommodationTypes
type AccommodationTypesDetail = { [T in AccommodationTypes as `${T}Detail`]: string }

type PreviousStaysDetailsBody = {
  accommodationTypes: Array<AccommodationTypes>
} & AccommodationTypesDetail

@Page({
  name: 'previous-stays-details',
  bodyProperties: ['accommodationTypes', ...Object.keys(accommodationTypes).map(key => `${key}Detail`)],
})
export default class PreviousStaysDetails implements TasklistPage {
  title: string

  htmlDocumentTitle = 'What type of accommodation did the person stay at?'

  constructor(
    readonly body: Partial<PreviousStaysDetailsBody>,
    readonly application: Application,
  ) {
    const name = personName(application.person)

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
    return 'previous-stays'
  }

  next() {
    return ''
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.accommodationTypes?.length) {
      const name = personName(this.application.person)

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
