import { statusTag } from './lostBedUtils'

describe('lostBedUtils', () => {
  describe('statusTag', () => {
    it('returns a correctly formatted string', () => {
      const result = statusTag('active', 'voidsOnly')

      expect(result).toEqual('<strong class="govuk-tag govuk-tag--blue">Active</strong>')
    })
  })
})
