import { TemporaryAccommodationApplication as Application } from '@approved-premises/api'
import type { TaskListErrors } from '@approved-premises/ui'
import { parseNaturalNumber } from '../../../../utils/formUtils'
import TasklistPage from '../../../tasklistPage'
import { Page } from '../../../utils/decorators'

type SentenceLengthBody = {
  years: string
  months: string
  weeks: string
  days: string
}

const sentenceLengthComponentResponse = (value: string, singularLabel: string, pluralLabel: string): string => {
  if (!value || !parseNaturalNumber(value)) {
    return ''
  }

  if (parseNaturalNumber(value) === 1) {
    return `${value} ${singularLabel}`
  }
  return `${value} ${pluralLabel}`
}

@Page({ name: 'sentence-length', bodyProperties: ['years', 'months', 'weeks', 'days'] })
export default class SentenceLength implements TasklistPage {
  title: string

  constructor(readonly body: Partial<SentenceLengthBody>, readonly application: Application) {
    this.title = 'What is the sentence length?'
  }

  response() {
    const years = sentenceLengthComponentResponse(this.body.years, 'year', 'years')
    const months = sentenceLengthComponentResponse(this.body.months, 'month', 'months')
    const weeks = sentenceLengthComponentResponse(this.body.weeks, 'week', 'weeks')
    const days = sentenceLengthComponentResponse(this.body.days, 'day', 'days')

    return {
      [this.title]: [years, months, weeks, days].filter(component => !!component).join(', '),
    }
  }

  previous() {
    return 'sentence-type'
  }

  next() {
    return 'sentence-expiry'
  }

  errors() {
    const errors: TaskListErrors<this> & { lengthComponents?: string } = {}

    const components = [this.body.years, this.body.months, this.body.weeks, this.body.days]

    const filteredComponents = components.filter(component => !!component)

    if (!filteredComponents.length) {
      errors.lengthComponents = 'You must specify the sentence length'
    } else {
      const numericComponents = filteredComponents.map(component => parseNaturalNumber(component))

      if (numericComponents.every(component => component === 0)) {
        errors.lengthComponents = 'You must specify a valid sentence length'
      } else if (numericComponents.some(component => Number.isNaN(component))) {
        errors.lengthComponents = 'The sentence length must be a number, like 2'
      }
    }

    return errors
  }
}
