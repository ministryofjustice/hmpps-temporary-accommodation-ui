/* istanbul ignore file */

import { Task } from '../../../utils/decorators'
import SentenceType from './sentenceType'

@Task({
  name: 'Basic information',
  slug: 'basic-information',
  pages: [SentenceType],
})
export default class BasicInformation {}
