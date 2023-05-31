/* istanbul ignore file */

import { Task } from '../../../utils/decorators'
import BackupContact from './backupContact'
import PractitionerPdu from './practitionerPdu'
import ProbationPractitioner from './probationPractitioner'

@Task({
  name: 'Contact details',
  actionText: 'Enter contact details',
  slug: 'contact-details',
  pages: [ProbationPractitioner, BackupContact, PractitionerPdu],
})
export default class ContactDetails {}
