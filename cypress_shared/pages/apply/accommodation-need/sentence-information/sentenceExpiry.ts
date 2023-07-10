import type { TemporaryAccommodationApplication } from '@approved-premises/api'
import paths from '../../../../../server/paths/apply'
import ApplyPage from '../../applyPage'

export default class SentenceExpiryPage extends ApplyPage {
  constructor(application: TemporaryAccommodationApplication) {
    super(
      'Sentence expiry date',
      application,
      'sentence-information',
      'sentence-expiry',
      paths.applications.pages.show({ id: application.id, task: 'sentence-information', page: 'sentence-length' }),
    )
  }

  completeForm() {
    this.completeDateInputsFromPageBody('sentenceExpiryDate')
  }
}
