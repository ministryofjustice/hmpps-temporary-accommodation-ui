import { Page } from '../../../utils/decorators'
import TasklistPage from '../../../tasklistPage'
import UpdatePractitionerDetail, { UpdatePractitionerDetailKey } from './updatePractitionerDetail'

@Page({ name: 'practitioner-phone', bodyProperties: ['phone'] })
export default class PractitionerPhone extends UpdatePractitionerDetail implements TasklistPage {
  title: string = 'What’s your phone number?'

  htmlDocumentTitle = this.title

  propertyName = 'phone' as UpdatePractitionerDetailKey
}
