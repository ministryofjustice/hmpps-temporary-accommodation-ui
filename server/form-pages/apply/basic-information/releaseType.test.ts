import { itShouldHavePreviousValue, itShouldHaveNextValue } from '../../shared-examples'

import ReleaseType from './releaseType'

describe('ReleaseType', () => {
  describe('body', () => {
    it('should strip unknown attributes from the body', () => {
      const page = new ReleaseType({ releaseType: 'rotl', something: 'else' })

      expect(page.body).toEqual({ releaseType: 'rotl' })
    })
  })

  itShouldHavePreviousValue(new ReleaseType({}), 'sentence-type')
  itShouldHaveNextValue(new ReleaseType({}), 'release-date')

  describe('errors', () => {
    it('should return an empty array if the release type is populated', () => {
      const page = new ReleaseType({ releaseType: 'rotl' })
      expect(page.errors()).toEqual([])
    })

    it('should return an errors if the release type is not populated', () => {
      const page = new ReleaseType({ releaseType: '' })
      expect(page.errors()).toEqual([
        {
          propertyName: 'releaseType',
          errorType: 'blank',
        },
      ])
    })
  })

  describe('items', () => {
    it('marks an option as selected when the releaseType is set', () => {
      const page = new ReleaseType({ releaseType: 'rotl' })

      const selectedOptions = page.items().filter(item => item.checked)

      expect(selectedOptions.length).toEqual(1)
      expect(selectedOptions[0].value).toEqual('rotl')
    })

    it('marks no options as selected when the releaseType is not set', () => {
      const page = new ReleaseType({})

      const selectedOptions = page.items().filter(item => item.checked)

      expect(selectedOptions.length).toEqual(0)
    })
  })
})
