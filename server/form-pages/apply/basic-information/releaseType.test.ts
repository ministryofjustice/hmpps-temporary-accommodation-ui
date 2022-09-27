import { itShouldHavePreviousValue, itShouldHaveNextValue } from '../../shared-examples'

import ReleaseType from './releaseType'

describe('ReleaseType', () => {
  const session = { 'basic-information': { 'sentence-type': { sentenceType: 'standardDeterminate' } } }

  describe('body', () => {
    it('should strip unknown attributes from the body', () => {
      const page = new ReleaseType({ releaseType: 'rotl', something: 'else' }, session)

      expect(page.body).toEqual({ releaseType: 'rotl' })
    })
  })

  itShouldHavePreviousValue(new ReleaseType({}, session), 'sentence-type')
  itShouldHaveNextValue(new ReleaseType({}, session), 'release-date')

  describe('errors', () => {
    it('should return an empty array if the release type is populated', () => {
      const page = new ReleaseType({ releaseType: 'rotl' }, session)
      expect(page.errors()).toEqual([])
    })

    it('should return an errors if the release type is not populated', () => {
      const page = new ReleaseType({ releaseType: '' }, session)
      expect(page.errors()).toEqual([
        {
          propertyName: '$.releaseType',
          errorType: 'empty',
        },
      ])
    })
  })

  describe('items', () => {
    describe('releaseType', () => {
      it('if the release type is "standardDeterminate" then all the items should be shown', () => {
        const items = new ReleaseType(
          { releaseType: 'standardDeterminate' },
          { 'basic-information': { 'sentence-type': { sentenceType: 'standardDeterminate' } } },
        ).items()

        expect(items.length).toEqual(5)
        expect(items[0].value).toEqual('rotl')
        expect(items[1].value).toEqual('hdc')
        expect(items[2].value).toEqual('license')
        expect(items[3].value).toEqual('pss')
        expect(items[4].value).toEqual('rerelease')
      })

      it('if the release type is "extendedDeterminate" then the reduced list of items should be shown', () => {
        const items = new ReleaseType(
          { releaseType: 'extendedDeterminate' },
          { 'basic-information': { 'sentence-type': { sentenceType: 'extendedDeterminate' } } },
        ).items()

        expect(items.length).toEqual(3)
        expect(items[0].value).toEqual('rotl')
        expect(items[1].value).toEqual('license')
        expect(items[2].value).toEqual('rerelease')
      })

      it('if the release type is "ipp" then the reduced list of items should be shown', () => {
        const items = new ReleaseType(
          { releaseType: 'ipp' },
          { 'basic-information': { 'sentence-type': { sentenceType: 'ipp' } } },
        ).items()

        expect(items.length).toEqual(3)
        expect(items[0].value).toEqual('rotl')
        expect(items[1].value).toEqual('license')
        expect(items[2].value).toEqual('rerelease')
      })

      it('if the release type is "life" then the reduced list of items should be shown', () => {
        const items = new ReleaseType(
          { releaseType: 'life' },
          { 'basic-information': { 'sentence-type': { sentenceType: 'life' } } },
        ).items()

        expect(items.length).toEqual(3)
        expect(items[0].value).toEqual('rotl')
        expect(items[1].value).toEqual('license')
        expect(items[2].value).toEqual('rerelease')
      })
    })

    it('marks an option as selected when the releaseType is set', () => {
      const page = new ReleaseType({ releaseType: 'rotl' }, session)

      const selectedOptions = page.items().filter(item => item.checked)

      expect(selectedOptions.length).toEqual(1)
      expect(selectedOptions[0].value).toEqual('rotl')
    })

    it('marks no options as selected when the releaseType is not set', () => {
      const page = new ReleaseType({}, session)

      const selectedOptions = page.items().filter(item => item.checked)

      expect(selectedOptions.length).toEqual(0)
    })
  })
})
