import { TemporaryAccommodationApplication as Application } from '@approved-premises/api'
import paths from '../../../../../server/paths/apply'

import ApplyPage from '../../applyPage'

export default class BackupContact extends ApplyPage {
  constructor(application: Application) {
    super(
      'Backup contact / senior probation officer details',
      application,
      'contact-details',
      'backup-contact',
      paths.applications.pages.show({ id: application.id, task: 'contact-details', page: 'probation-practitioner' }),
    )
  }

  completeForm() {
    this.completeTextInputFromPageBody('name')
    this.completeTextInputFromPageBody('phone')
    this.completeTextInputFromPageBody('email')
  }
}
