import applicationFactory from '../../../../testutils/factories/application'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'
import ExamplePage from './examplePage'

describe('ExamplePage', () => {
  const application = applicationFactory.build()

  describe('body', () => {
    it('should set the body', () => {
      const page = new ExamplePage({ exampleAnswer: 'yes' }, application)

      expect(page.body).toEqual({ exampleAnswer: 'yes' })
    })
  })

  itShouldHavePreviousValue(new ExamplePage({}, application), '')
  itShouldHaveNextValue(new ExamplePage({}, application), 'sentence-type')

  describe('errors', () => {
    it('should return an empty object if exampleAnswer is populated', () => {
      const page = new ExamplePage({ exampleAnswer: 'yes' }, application)
      expect(page.errors()).toEqual({})
    })

    it('should return an errors if exampleAnswer is not populated', () => {
      const page = new ExamplePage({}, application)
      expect(page.errors()).toEqual({ exampleAnswer: 'You must answer yes or no' })
    })
  })

  describe('response', () => {
    it('should return a translated version of the response', () => {
      const page = new ExamplePage({ exampleAnswer: 'yes' }, application)

      expect(page.response()).toEqual({
        [page.title]: 'Yes',
      })
    })
  })
})
