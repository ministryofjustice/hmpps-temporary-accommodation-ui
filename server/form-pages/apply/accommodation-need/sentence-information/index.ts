/* istanbul ignore file */

import { Task } from '../../../utils/decorators'
import SentenceType from './sentenceType'

@Task({
  name: 'Sentence information',
  actionText: 'Add sentence information',
  slug: 'sentence-information',
  pages: [SentenceType],
})
export default class SentenceInformation {}
