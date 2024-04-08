/* istanbul ignore file */

const testTemplate = (
  pageClassName: string,
  pageFileName: string,
) => `import { applicationFactory } from '../../../../testutils/factories'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'
import ${pageClassName} from './${pageFileName}'

const body = {}

describe('${pageClassName}', () => {
  const application = applicationFactory.build()

  describe('body', () => {
    it('sets the body', () => {
      const page = new ${pageClassName}(body, application)

      expect(page.body).toEqual(body)
    })
  })

  // TODO: Update next and previous values and add logic tests (if applicable)
  itShouldHavePreviousValue(new ${pageClassName}({}, application), 'dashboard')
  itShouldHaveNextValue(new ${pageClassName}({}, application), '')

  // TODO: Add error tests (if applicable)
  describe('errors', () => {})

  // TODO: Add response tests
  describe('response', () => {})
})
`

export default testTemplate
