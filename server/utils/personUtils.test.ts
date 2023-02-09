import { isApplicableTier, statusTag, tierBadge } from './personUtils'

describe('personUtils', () => {
  describe('statusTag', () => {
    it('returns an "In Community" tag for an InCommunity status', () => {
      expect(statusTag('InCommunity')).toEqual(
        `<strong class="govuk-tag" data-cy-status="InCommunity">In Community</strong>`,
      )
    })

    it('returns an "In Custody" tag for an InCustody status', () => {
      expect(statusTag('InCustody')).toEqual(`<strong class="govuk-tag" data-cy-status="InCustody">In Custody</strong>`)
    })
  })

  describe('tierBadge', () => {
    it('returns the correct tier badge for A', () => {
      expect(tierBadge('A')).toEqual('<span class="moj-badge moj-badge--red">A</span>')
    })

    it('returns the correct tier badge for B', () => {
      expect(tierBadge('B')).toEqual('<span class="moj-badge moj-badge--purple">B</span>')
    })
  })

  describe('isApplicableTier', () => {
    it(`returns true if the person's sex is male and has an applicable tier`, () => {
      expect(isApplicableTier('Male', 'A3')).toBeTruthy()
    })

    it(`returns false if the person's sex is male and has a tier that is not applicable to males`, () => {
      expect(isApplicableTier('Male', 'C3')).toBeFalsy()
    })

    it(`returns false if the person's sex is male and has an inapplicable tier`, () => {
      expect(isApplicableTier('Male', 'D1')).toBeFalsy()
    })

    it(`returns true if the person's sex is female and has an applicable tier`, () => {
      expect(isApplicableTier('Female', 'A3')).toBeTruthy()
    })

    it(`returns true if the person's sex is female and has a tier that is applicable to females`, () => {
      expect(isApplicableTier('Female', 'C3')).toBeTruthy()
    })

    it(`returns false if the person's sex is female and has an inapplicable tier`, () => {
      expect(isApplicableTier('Female', 'D1')).toBeFalsy()
    })
  })
})
