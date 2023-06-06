import TasklistPage from '../../../tasklistPage'
import { Page } from '../../../utils/decorators'
import ContactDetails from '../../contactDetails'

@Page({ name: 'probation-practitioner', bodyProperties: ['name', 'phone', 'email'] })
export default class ProbationPractitioner extends ContactDetails implements TasklistPage {
  title = 'Probation practitioner details'

  previousPageId = 'dashboard'

  nextPageId = 'backup-contact'
}
