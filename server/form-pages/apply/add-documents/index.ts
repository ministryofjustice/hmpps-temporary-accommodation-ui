/* istanbul ignore file */
import { Section, Task } from '../../utils/decorators'

@Task({
  name: 'Attach required documents',
  slug: 'attach-required-documents',
  pages: [],
})
@Section({
  title: 'Add documents',
  tasks: [AddDocuments],
})
export default class AddDocuments {}
