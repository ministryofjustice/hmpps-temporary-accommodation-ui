import { applicationFactory, personFactory } from '../../../../testutils/factories'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'
import Needs from './needs'

const body = {
  needs: ['hearingImpairment' as const, 'visualImpairment' as const, 'language' as const],
  hearingImpairmentDetail: 'Hearing impairment detail',
  visualImpairmentDetail: 'Visual impairment detail',
  languageDetail: 'Language needs detail',
}

describe('Needs', () => {
  const application = applicationFactory.build({
    person: personFactory.build({
      name: 'John Smith',
    }),
  })

  describe('body', () => {
    it('sets the body', () => {
      const page = new Needs(body, application)

      expect(page.body).toEqual(body)
    })
  })

  itShouldHavePreviousValue(new Needs({}, application), 'dashboard')
  itShouldHaveNextValue(new Needs({}, application), 'property-attributes-or-adaptations')

  describe('errors', () => {
    it('returns an empty object if the needs array is populated and the associated details are present', () => {
      const page = new Needs(body, application)
      expect(page.errors()).toEqual({})
    })

    it("returns an empty object if the needs array cotains only 'none'", () => {
      const page = new Needs({ needs: ['none'] }, application)
      expect(page.errors()).toEqual({})
    })

    it('returns an error if needs is not populated', () => {
      const page = new Needs({ needs: [] }, application)
      expect(page.errors()).toEqual({
        needs: 'You must specify whether John Smith has any of the following needs',
      })
    })

    it("returns an error if needs is populated with 'none' alongside other needs", () => {
      const page = new Needs({ ...body, needs: [...body.needs, 'none'] }, application)
      expect(page.errors()).toEqual({
        needs: "You must select John Smith's needs, or select 'None of the above'",
      })
    })

    it('returns errors if the needs array is populated but the associated details are not present', () => {
      const page = new Needs({ needs: ['mobility' as const, 'neurodivergence' as const, 'language'] }, application)
      expect(page.errors()).toEqual({
        mobilityDetail: "You must provide details about the person's mobility needs",
        neurodivergenceDetail: "You must provide details about the person's neurodivergence",
        languageDetail: "You must provide details about the person's language needs",
      })
    })
  })

  describe('response', () => {
    it('returns a translated version of the response', () => {
      const page = new Needs(body, application)
      expect(page.response()).toEqual({
        'Hearing impairment': 'Hearing impairment detail',
        'Visual impairment': 'Visual impairment detail',
        Language: 'Language needs detail',
      })
    })

    it("does not include 'none' in the response", () => {
      const page = new Needs({ needs: ['none'] }, application)
      expect(page.response()).toEqual({})
    })
  })

  describe('items', () => {
    it('returns radio button items with any additional need label text', () => {
      const page = new Needs(body, application)
      expect(page.items()).toEqual(
        expect.arrayContaining([
          { value: 'hearingImpairment', text: 'Hearing impairment' },
          {
            value: 'language',
            text: 'Language',
            detailLabel: 'Provide details including whether the person needs an interpreter and for what language',
          },
          { value: 'visualImpairment', text: 'Visual impairment' },
        ]),
      )
    })
  })
})
