import { Page } from '../../../utils/decorators'
import TasklistPage from '../../../tasklistPage'
import UpdatePractitionerDetail, { UpdatePractitionerDetailKey } from './updatePractitionerDetail'

@Page({ name: 'practitioner-email', bodyProperties: ['email'] })
export default class PractitionerEmail extends UpdatePractitionerDetail implements TasklistPage {
  title: string = 'Update probation practitioner email address'

  htmlDocumentTitle = this.title

  propertyName = 'email' as UpdatePractitionerDetailKey
}
