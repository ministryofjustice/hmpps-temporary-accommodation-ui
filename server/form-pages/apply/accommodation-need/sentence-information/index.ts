/* istanbul ignore file */

import { Task } from '../../../utils/decorators'
import SentenceType from './sentenceType'

@Task({
  name: 'Sentence information',
  slug: 'sentence-information',
  pages: [SentenceType],
})
export default class SentenceInformation {}
