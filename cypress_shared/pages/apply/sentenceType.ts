import type { TemporaryAccommodationApplication } from '@approved-premises/api'

import ApplyPage from './applyPage'

export default class SentenceTypePage extends ApplyPage {
  constructor(application: TemporaryAccommodationApplication) {
    super(
      'Which of the following best describes the sentence type the person is on?',
      application,
      'basic-information',
      'sentence-type',
    )
  }

  completeForm() {
    this.checkRadioButtonFromPageBody('sentenceType')
  }
}
