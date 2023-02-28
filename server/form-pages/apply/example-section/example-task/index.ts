/* istanbul ignore file */

import { Task } from '../../../utils/decorators'
import ExamplePage from './examplePage'
import SentenceType from './sentenceType'

@Task({
  name: 'Example task',
  slug: 'example-task',
  pages: [ExamplePage, SentenceType],
})
export default class ExampleTask {}
