import type { TemporaryAccommodationApplication } from '@approved-premises/api'

import paths from '../../../../../server/paths/apply'
import ApplyPage from '../../applyPage'

export default class SentenceLengthPage extends ApplyPage {
  constructor(application: TemporaryAccommodationApplication) {
    super(
      'What is the sentence length?',
      application,
      'sentence-information',
      'sentence-length',
      paths.applications.pages.show({ id: application.id, task: 'sentence-information', page: 'sentence-type' }),
    )
  }

  completeForm() {
    if (this.tasklistPage.body.years) {
      this.completeTextInputFromPageBody('years')
    }
    if (this.tasklistPage.body.months) {
      this.completeTextInputFromPageBody('months')
    }
    if (this.tasklistPage.body.weeks) {
      this.completeTextInputFromPageBody('weeks')
    }
    if (this.tasklistPage.body.days) {
      this.completeTextInputFromPageBody('days')
    }
  }
}
