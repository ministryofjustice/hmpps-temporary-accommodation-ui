import { statusName, statusTag } from './assessmentStatusUtils'

describe('assessmentUtils', () => {
  describe('statusTag', () => {
    it('returns the HTML tag for a given status', () => {
      expect(statusTag('unallocated')).toEqual('<strong class="govuk-tag govuk-tag--grey">Unallocated</strong>')
    })
  })

  describe('statusName', () => {
    it('returns the display name for a given status', () => {
      expect(statusName('in_review')).toEqual('In review')
    })
  })
})
