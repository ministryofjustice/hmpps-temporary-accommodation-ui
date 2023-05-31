import { TemporaryAccommodationApplication as Application } from '@approved-premises/api'
import paths from '../../../server/paths/apply'

import ContactDetails from './contactDetails'

export default class BackupContact extends ContactDetails {
  constructor(application: Application) {
    super(
      'Backup contact / senior probation officer details',
      application,
      'contact-details',
      'backup-contact',
      paths.applications.pages.show({ id: application.id, task: 'contact-details', page: 'probation-practitioner' }),
    )
  }
}
