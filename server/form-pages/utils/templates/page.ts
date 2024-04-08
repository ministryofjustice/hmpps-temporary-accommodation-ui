/* istanbul ignore file */

const pageTemplate = (
  pageClassName: string,
  pageSlug: string,
) => `import { TemporaryAccommodationApplication as Application } from '@approved-premises/api'
import type { TaskListErrors, TasklistPage } from '@approved-premises/ui'
import { Page } from '../../../utils/decorators'

type ${pageClassName}Body = {}

@Page({ name: '${pageSlug}', bodyProperties: [] })
export default class ${pageClassName} implements TasklistPage {
  // TODO: Add title of page
  title = 'Page title'

  htmlDocumentTitle = this.title

  // TODO: Add the body params to the constructor
  constructor(
    readonly body: Partial<${pageClassName}Body>,
    readonly application: Application,
  ) {}

  // TODO: Add logic to translate the response (if applicable)
  response() {
    return {}
  }

  // TODO: Set the previous page (if applicable)
  previous() {
    return ''
  }

  // TODO: Set the next page (if applicable)
  next() {
    return ''
  }

  // TODO: Add logic for error handling
  errors() {
    const errors: TaskListErrors<this> = {}

    return errors
  }
}
`

export default pageTemplate
