import { Page } from '../../../utils/decorators'
import TasklistPage from '../../../tasklistPage'
import UpdatePractitionerDetail, { UpdatePractitionerDetailKey } from './updatePractitionerDetail'

@Page({ name: 'practitioner-name', bodyProperties: ['name'] })
export default class PractitionerName extends UpdatePractitionerDetail implements TasklistPage {
  title: string = 'What’s your name?'

  htmlDocumentTitle = this.title

  propertyName = 'name' as UpdatePractitionerDetailKey
}
