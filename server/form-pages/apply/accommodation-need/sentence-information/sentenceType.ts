import { TemporaryAccommodationApplication as Application } from '@approved-premises/api'
import type { TaskListErrors } from '@approved-premises/ui'
import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'

export const sentenceTypes = {
  standardDeterminate: 'Standard determinate custody',
  life: 'Life sentence',
  ipp: 'Indeterminate public protection (IPP)',
  extendedDeterminate: 'Extended determinate custody',
  offenderRehabilitationAct: 'Offender Rehabilitation Act (ORA) adult custody',
} as const

export type SentenceTypesT = keyof typeof sentenceTypes

@Page({ name: 'sentence-type', bodyProperties: ['sentenceType'] })
export default class SentenceType implements TasklistPage {
  title = 'Which of the following best describes the sentence type?'

  constructor(readonly body: { sentenceType?: SentenceTypesT }, readonly application: Application) {}

  response() {
    return { [this.title]: sentenceTypes[this.body.sentenceType] }
  }

  previous() {
    return 'dashboard'
  }

  next() {
    return 'sentence-expiry'
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.sentenceType) {
      errors.sentenceType = 'You must choose a sentence type'
    }

    return errors
  }

  items() {
    return Object.keys(sentenceTypes).map(key => {
      return {
        value: key,
        text: sentenceTypes[key],
        checked: this.body.sentenceType === key,
      }
    })
  }
}
