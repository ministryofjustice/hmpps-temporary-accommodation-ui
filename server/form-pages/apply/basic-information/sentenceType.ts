import TasklistPage from '../../tasklistPage'

export const sentenceTypes = {
  standardDeterminate: 'Standard determinate custody',
  communityOrder: 'Community Order',
  bailPlacement: 'Bail placement',
  extendedDeterminate: 'Extended determinate custody',
  ipp: 'Indeterminate Public Protection',
  nonStatutory: 'Non-statutory',
  life: 'Life sentence',
} as const

export type SentenceTypesT = keyof typeof sentenceTypes

export default class SentenceType implements TasklistPage {
  name = 'sentence-type'

  title = 'Which of the following best describes the sentence type?'

  body: { sentenceType: SentenceTypesT }

  constructor(body: Record<string, unknown>) {
    this.body = {
      sentenceType: body.sentenceType as SentenceTypesT,
    }
  }

  response() {
    return { [this.title]: sentenceTypes[this.body.sentenceType] }
  }

  next() {
    switch (this.body.sentenceType) {
      case 'standardDeterminate':
        return 'release-type'
      case 'communityOrder':
        return 'situation'
      case 'bailPlacement':
        return 'situation'
      case 'extendedDeterminate':
        return 'release-type'
      case 'ipp':
        return 'release-type'
      case 'life':
        return 'release-type'
      default:
        throw new Error('The release type is invalid')
    }
  }

  errors() {
    const errors = []

    if (!this.body.sentenceType) {
      errors.push({
        propertyName: '$.sentenceType',
        errorType: 'empty',
      })
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
