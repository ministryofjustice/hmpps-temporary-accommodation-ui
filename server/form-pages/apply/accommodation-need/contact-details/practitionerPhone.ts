import { Page } from '../../../utils/decorators'
import TasklistPage from '../../../tasklistPage'
import UpdatePractitionerDetail, { UpdatePractitionerDetailKey } from './updatePractitionerDetail'

@Page({ name: 'practitioner-phone', bodyProperties: ['phone'] })
export default class PractitionerPhone extends UpdatePractitionerDetail implements TasklistPage {
  title: string = 'Update probation practitioner phone number'

  htmlDocumentTitle = this.title

  propertyName = 'phone' as UpdatePractitionerDetailKey
}
