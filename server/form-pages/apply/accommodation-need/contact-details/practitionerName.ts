import { Page } from '../../../utils/decorators'
import TasklistPage from '../../../tasklistPage'
import UpdatePractitionerDetail, { UpdatePractitionerDetailKey } from './updatePractitionerDetail'

@Page({ name: 'practitioner-name', bodyProperties: ['name'] })
export default class PractitionerName extends UpdatePractitionerDetail implements TasklistPage {
  title: string = 'Update probation practitioner name'

  htmlDocumentTitle = this.title

  propertyName = 'name' as UpdatePractitionerDetailKey
}
