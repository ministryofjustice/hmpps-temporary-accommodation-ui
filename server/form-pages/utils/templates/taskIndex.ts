/* istanbul ignore file */

const taskIndexTemplate = (taskClassName: string, taskSlug: string, taskTitle: string) => `/* istanbul ignore file */

import { Task } from '../../../utils/decorators'

@Task({
  name: '${taskTitle}',
  actionText: '${taskTitle}',
  slug: '${taskSlug}',
  pages: [],
})
export default class ${taskClassName} {}
`

export default taskIndexTemplate
