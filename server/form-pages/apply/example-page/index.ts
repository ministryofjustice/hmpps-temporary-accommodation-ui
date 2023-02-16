import { Section } from '../../utils/decorators'

import ExampleTask from './example-task'

@Section({ title: 'Example section', tasks: [ExampleTask] })
export default class ExampleSection {}
