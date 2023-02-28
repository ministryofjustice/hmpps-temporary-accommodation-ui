import type { ApprovedPremisesApplication } from '@approved-premises/api'

import ApplyPage from './applyPage'

export default class SentenceTypePage extends ApplyPage {
  constructor(application: ApprovedPremisesApplication) {
    super(
      'Which of the following best describes the sentence type the person is on?',
      application,
      'example-task',
      'sentence-type',
      'example-page',
    )
  }

  completeForm() {
    this.checkRadioButtonFromPageBody('sentenceType')
  }
}
