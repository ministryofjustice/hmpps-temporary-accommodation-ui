/* istanbul ignore file */

const pageObjectTemplate = (
  pageClass: string,
  pageName: string,
  taskName: string,
) => `import type { TemporaryAccommodationApplication } from '@approved-premises/api'
import paths from '../../../../../server/paths/apply'
import ApplyPage from '../../applyPage'

export default class ${pageClass}Page extends ApplyPage {
  constructor(application: TemporaryAccommodationApplication) {
    super(
      '', // TODO: Add page title
      application,
      '${taskName}',
      '${pageName}',
      paths.applications.show({
        id: application.id,
      }),
    )
  }

  // TODO: Add form completion methods
}
`
export default pageObjectTemplate
