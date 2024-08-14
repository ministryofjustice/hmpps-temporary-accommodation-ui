import { TemporaryAccommodationApplication as Application } from '@approved-premises/api'
import type { PageResponse, TaskListErrors } from '@approved-premises/ui'
import { Page } from '../../../utils/decorators'

import { personName } from '../../../../utils/personUtils'
import TasklistPage from '../../../tasklistPage'

type PersonNeedField = {
  text: string
  error?: string
  detailLabel?: string
}

const personNeeds: Record<string, PersonNeedField> = {
  hearingImpairment: {
    text: 'Hearing impairment',
    error: "You must provide details about the person's hearing impairment",
  },
  language: {
    text: 'Language',
    detailLabel: 'Provide details including whether the person needs an interpreter and for what language',
    error: "You must provide details about the person's language needs",
  },
  learningDisability: {
    text: 'Learning disability',
    error: "You must provide details about the person's learning disability",
  },
  mentalHealth: {
    text: 'Mental health',
    error: 'You must provide details about mental health needs',
  },
  mobility: {
    text: 'Mobility needs',
    error: "You must provide details about the person's mobility needs",
  },
  neurodivergence: {
    text: 'Neurodivergence',
    error: "You must provide details about the person's neurodivergence",
  },
  physicalHealth: {
    text: 'Physical health condition, for example diabetes, epilepsy, asthma',
    error: "You must provide details about the person's physical health condition",
  },
  visualImpairment: {
    text: 'Visual impairment',
    error: "You must provide details about the person's visual impairment",
  },
  other: {
    text: 'Another need',
    detailLabel: 'Please specify',
    error: "You must provide details about the person's other needs",
  },
  none: {
    text: 'None of the above',
  },
} as const

type PersonNeeds = keyof typeof personNeeds
type PersonNeedsDetail = { [T in PersonNeeds as `${T}Detail`]: string }

type NeedsBody = {
  needs: Array<PersonNeeds>
} & Omit<PersonNeedsDetail, 'none'>

@Page({
  name: 'needs',
  bodyProperties: [
    'needs',
    ...Object.keys(personNeeds)
      .filter(key => key !== 'none')
      .map(key => `${key}Detail`),
  ],
})
export default class Needs implements TasklistPage {
  title: string

  htmlDocumentTitle = 'Does the person have any of the following needs?'

  constructor(
    readonly body: Partial<NeedsBody>,
    readonly application: Application,
  ) {
    this.title = `Does ${personName(application.person)} have any of the following needs?`
  }

  response() {
    const response: PageResponse = {}

    this.body.needs?.forEach(need => {
      if (need !== 'none') {
        response[personNeeds[need].text] = this.body[`${need}Detail`]
      }
    })

    return response
  }

  previous() {
    return 'dashboard'
  }

  next() {
    return 'property-attributes-or-adaptations'
  }

  errors() {
    const errors: Record<string, string> = {}

    if (!this.body.needs?.length) {
      errors.needs = `You must specify whether ${personName(this.application.person)} has any of the following needs`
    } else if (this.body.needs.length > 1 && this.body.needs.includes('none')) {
      errors.needs = `You must select ${personName(this.application.person)}'s needs, or select 'None of the above'`
    }

    this.body.needs?.forEach(need => {
      if (need !== 'none') {
        const detailKey = `${need}Detail` as keyof PersonNeedsDetail
        if (!this.body[detailKey]) {
          errors[detailKey] = personNeeds[need].error
        }
      }
    })

    return errors as TaskListErrors<this>
  }

  items() {
    return Object.keys(personNeeds).map(key => {
      return {
        value: key,
        text: personNeeds[key].text,
        detailLabel: personNeeds[key].detailLabel,
      }
    })
  }
}
