/* istanbul ignore file */

import { Task } from '../../../utils/decorators'
import ExamplePage from './examplePage'

@Task({
  name: 'Example task',
  slug: 'example-task',
  pages: [ExamplePage],
})
export default class ExampleTask {}
