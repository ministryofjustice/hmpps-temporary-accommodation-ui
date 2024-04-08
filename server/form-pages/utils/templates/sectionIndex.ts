/* istanbul ignore file */

const sectionIndexTemplate = (sectionClassName: string, sectionTitle: string) => `/* istanbul ignore file */

import { Section } from '../../utils/decorators'

@Section({
  title: '${sectionTitle}',
  tasks: [],
})
export default class ${sectionClassName} {}
`

export default sectionIndexTemplate
