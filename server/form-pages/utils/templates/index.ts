/* istanbul ignore file */

const indexTemplate = (pageClassName: string, pageFileName: string) => `/* istanbul ignore file */

import ${pageClassName} from './${pageFileName}'

const pages = {
  '${pageFileName}': ${pageClassName},
}

export default pages
`

export default indexTemplate
