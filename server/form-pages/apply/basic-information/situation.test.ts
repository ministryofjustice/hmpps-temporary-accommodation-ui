import { itShouldHavePreviousValue, itShouldHaveNextValue } from '../../shared-examples'

import Situation from './situation'

describe('Situation', () => {
  itShouldHavePreviousValue(new Situation({}), 'sentence-type')
  itShouldHaveNextValue(new Situation({}), 'release-date')

  describe('errors', () => {
    it('should return an empty array if the situation is populated', () => {
      const page = new Situation({ situation: 'riskManagement' })
      expect(page.errors()).toEqual([])
    })

    it('should return an errors if the situation is not populated', () => {
      const page = new Situation({ situation: '' })
      expect(page.errors()).toEqual([
        {
          propertyName: 'situation',
          errorType: 'blank',
        },
      ])
    })
  })

  describe('items', () => {
    it('marks an option as selected when the releaseType is set', () => {
      const page = new Situation({ situation: 'riskManagement' })

      const selectedOptions = page.items().filter(item => item.checked)

      expect(selectedOptions.length).toEqual(1)
      expect(selectedOptions[0].value).toEqual('riskManagement')
    })

    it('marks no options as selected when the releaseType is not set', () => {
      const page = new Situation({})

      const selectedOptions = page.items().filter(item => item.checked)

      expect(selectedOptions.length).toEqual(0)
    })
  })
})
