/* istanbul ignore file */

import { Section, Task } from '../../utils/decorators'
import AttachDocuments from './attachDocuments'

@Task({
  name: 'Attach required documents',
  slug: 'attach-required-documents',
  pages: [AttachDocuments],
})
@Section({
  title: 'Add documents',
  tasks: [AddDocuments],
})
export default class AddDocuments {}
