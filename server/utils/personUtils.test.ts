import { personFactory, restrictedPersonFactory } from '../testutils/factories'
import { isApplicableTier, isFullPerson, personName, statusTag, tierBadge } from './personUtils'

describe('personUtils', () => {
  describe('statusTag', () => {
    it('returns an "In Community" tag for an InCommunity status', () => {
      expect(statusTag('InCommunity')).toEqual(
        `<strong class="govuk-tag" data-cy-status="InCommunity">In community</strong>`,
      )
    })

    it('returns an "In Custody" tag for an InCustody status', () => {
      expect(statusTag('InCustody')).toEqual(`<strong class="govuk-tag" data-cy-status="InCustody">In custody</strong>`)
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

  describe('personName', () => {
    it('returns the name of the given person if the person is not a LAO', () => {
      const person = personFactory.build({ name: 'John Smith' })

      expect(personName(person)).toEqual('John Smith')
    })

    it('returns the name of the given person if the given person is not a LAO, even if the fallback string is specified', () => {
      const person = personFactory.build({ name: 'John Smith' })

      expect(personName(person, 'Limited access offender')).toEqual('John Smith')
    })

    it('returns "this person" if the person is a LAO', () => {
      const person = restrictedPersonFactory.build()

      expect(personName(person)).toEqual('the person')
    })

    it('returns the fallback string if specified and the person is a LAO', () => {
      const person = restrictedPersonFactory.build()

      expect(personName(person, 'Limited access offender')).toEqual('Limited access offender')
    })
  })

  describe('isFullPerson', () => {
    it('returns true if the person is not a LAO', () => {
      const person = personFactory.build()

      expect(isFullPerson(person)).toEqual(true)
    })

    it('returns false if the person is a LAO', () => {
      const person = restrictedPersonFactory.build()

      expect(isFullPerson(person)).toEqual(false)
    })
  })
})
