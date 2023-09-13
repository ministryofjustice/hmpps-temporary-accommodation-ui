import TasklistPage from '../../../tasklistPage'
import { Page } from '../../../utils/decorators'
import ContactDetails from '../../contactDetails'

@Page({ name: 'backup-contact', bodyProperties: ['name', 'phone', 'email'] })
export default class BackupContact extends ContactDetails implements TasklistPage {
  title = 'Backup contact / senior probation officer details'

  htmlDocumentTitle = this.title

  nextPageId = 'practitioner-pdu'

  previousPageId = 'probation-practitioner'
}
