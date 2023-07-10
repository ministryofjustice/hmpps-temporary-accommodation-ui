import type { TemporaryAccommodationApplication } from '@approved-premises/api'

import ApplyPage from '../../applyPage'
import paths from '../../../../../server/paths/apply'

export default class SentenceTypePage extends ApplyPage {
  constructor(application: TemporaryAccommodationApplication) {
    super(
      'Which of the following best describes the sentence type?',
      application,
      'sentence-information',
      'sentence-type',
      paths.applications.pages.show({ id: application.id, task: 'sentence-information', page: 'offending-summary' }),
    )
  }

  completeForm() {
    this.checkRadioButtonFromPageBody('sentenceType')
  }
}
