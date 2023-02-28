/* istanbul ignore file */

import { Task } from '../../../utils/decorators'
import SentenceType from './sentenceType'

@Task({
  name: 'Example task',
  slug: 'example-task',
  pages: [SentenceType],
})
export default class ExampleTask {}
