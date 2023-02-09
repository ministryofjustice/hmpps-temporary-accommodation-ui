/* istanbul ignore file */

const pageObjectTemplate = (pageName: string) => `import Page from '../page'

export default class ${pageName}Page extends Page {
  constructor() {
    // TODO: Add title of page
    super('')
  }

  // TODO: Add form completion methods
}
`
export default pageObjectTemplate
