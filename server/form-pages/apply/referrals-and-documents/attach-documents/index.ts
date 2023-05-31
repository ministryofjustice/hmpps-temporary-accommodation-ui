/* istanbul ignore file */

import { Task } from '../../../utils/decorators'
import AttachDocuments from './attachDocuments'

@Task({
  name: 'Attach documents',
  slug: 'attach-documents',
  pages: [AttachDocuments],
})
export default class AttachDocumentsTask {}
