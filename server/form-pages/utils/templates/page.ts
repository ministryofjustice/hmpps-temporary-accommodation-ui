/* istanbul ignore file */

const pageTemplate = (
  pageClassName: string,
  pageName: string,
) => `import type { TaskListErrors } from '@approved-premises/ui'

import TasklistPage from '../../tasklistPage'

export default class ${pageClassName} implements TasklistPage {
  name = '${pageName}'

  // TODO: Add title of page
  title = ''

  body: {}

  // TODO: Add the body params to the constructor
  constructor(body: Record<string, unknown>) {}

  // TODO: Set the previous page (if applicable)
  previous() {
    return ''
  }

  // TODO: Set the next page (if applicable)
  next() {
    return ''
  }

  // TODO: Add logic to translate the response (if applicable)
  response() {}

  // TODO: Add logic for error handling
  errors() {
    const errors: TaskListErrors<this> = {}

    return errors
  }
}
`

export default pageTemplate
