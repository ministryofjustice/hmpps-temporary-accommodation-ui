/* istanbul ignore file */

const testTemplate = (
  pageClassName: string,
  pageFileName: string,
) => `import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../shared-examples'

import ${pageClassName} from './${pageFileName}'

describe('${pageClassName}', () => {

  // TODO: Add title tests (if applicable)
  describe('title', () => {})

  // TODO: Add body tests (if applicable)
  describe('body', () => {
    it('should strip unknown attributes from the body', () => {})
  })

  // TODO: Update next and previous values and add logic tests (if applicable)
  itShouldHaveNextValue(new ${pageClassName}({}), '')
  itShouldHavePreviousValue(new ${pageClassName}({}), '')

  // TODO: Add error tests (if applicable)
  describe('errors', () => {})

  // TODO: Add response tests
  describe('response', () => {})
})
`

export default testTemplate
