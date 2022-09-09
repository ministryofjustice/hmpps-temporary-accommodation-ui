import type { TasklistPage } from 'approved-premises'

// TODO: The options that appear will depend on the response to the previous question.
// For now we'll return all options
export enum Situations {
  riskManagement = 'Referral for risk management',
  residencyManagenent = 'Residency management',
  bailAssessment = 'Bail assessment for community penalty',
  bailSentence = 'Bail sentence',
}

export default class Situation implements TasklistPage {
  name = 'situation'

  title = 'Which of the following options best describes the situation?'

  body: { situation: keyof Situations }

  constructor(body: Record<string, unknown>) {
    this.body = {
      situation: body.situation as keyof Situations,
    }
  }

  next() {
    return 'release-date'
  }

  previous() {
    return 'sentence-type'
  }

  errors() {
    const errors = []

    if (!this.body.situation) {
      errors.push({
        propertyName: 'situation',
        errorType: 'blank',
      })
    }

    return errors
  }

  items() {
    return Object.keys(Situations).map(key => {
      return {
        value: key,
        text: Situations[key],
        checked: this.body.situation === key,
      }
    })
  }
}
