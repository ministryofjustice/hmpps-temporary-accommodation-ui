/* istanbul ignore file */

import { Task } from '../../../utils/decorators'
import BackupContact from './backupContact'
import PractitionerPdu from './practitionerPdu'
import ProbationPractitioner from './probationPractitioner'
import PopPhoneNumber from './popPhoneNumber'
import PractitionerName from './practitionerName'
import PractitionerEmail from './practitionerEmail'
import PractitionerPhone from './practitionerPhone'

@Task({
  name: 'Contact details',
  actionText: 'Enter contact details',
  slug: 'contact-details',
  pages: [
    ProbationPractitioner,
    PractitionerName,
    PractitionerEmail,
    PractitionerPhone,
    BackupContact,
    PractitionerPdu,
    PopPhoneNumber,
  ],
})
export default class ContactDetails {}
