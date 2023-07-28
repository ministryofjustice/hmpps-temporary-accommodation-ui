import { ApprovedPremisesApplication as Application } from '@approved-premises/api'
import type { TaskListErrors } from '@approved-premises/ui'
import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'

const personNeeds = {
  hearingImpairment: {
    text: 'Hearing impairment',
    error: "You must provide details about the person's hearing impairment",
  },
  mentalHealth: {
    text: 'Mental health',
    error: 'You must provide details about mental health needs',
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
  mobility: {
    text: 'Mobility needs',
    error: "You must provide details about the person's mobility needs",
  },
  neurodivergence: {
    text: 'Neurodivergence',
    error: "You must provide details about the person's neurodivergence",
  },
  visualImpairment: {
    text: 'Visual impairment',
    error: "You must provide details about the person's visual impairment",
  },
  other: {
    text: 'Other',
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
} & PersonNeedsDetail

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

  constructor(
    readonly body: Partial<NeedsBody>,
    readonly application: Application,
  ) {
    this.title = `Does ${application.person.name} have any of the following needs?`
  }

  response() {
    const response = {}

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
    const errors: TaskListErrors<this> = {}

    if (!this.body.needs?.length) {
      errors.needs = `You must specify whether ${this.application.person.name} has any of the following needs`
    } else if (this.body.needs.length > 1 && this.body.needs.includes('none')) {
      errors.needs = `You must select ${this.application.person.name}'s needs, or select 'None of the above'`
    }

    this.body.needs?.forEach(need => {
      if (need !== 'none') {
        const detailKey = `${need}Detail`
        if (!this.body[detailKey]) {
          errors[detailKey] = personNeeds[need].error
        }
      }
    })

    return errors
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
