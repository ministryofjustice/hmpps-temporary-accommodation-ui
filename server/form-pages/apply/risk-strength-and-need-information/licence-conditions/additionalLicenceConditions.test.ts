import { applicationFactory } from '../../../../testutils/factories'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'
import AdditionalLicenceConditions from './additionalLicenceConditions'

const body = {
  conditions: ['curfew' as const, 'exclusionZone' as const, 'programmes' as const],
  curfewDetail: 'Curfew detail',
  exclusionZoneDetail: 'Exclusion zone detail',
  programmesDetail: 'Programmes detail',
}

describe('AdditionalLicenceConditions', () => {
  const application = applicationFactory.build()

  describe('body', () => {
    it('sets the body', () => {
      const page = new AdditionalLicenceConditions(body, application)

      expect(page.body).toEqual(body)
    })
  })

  itShouldHavePreviousValue(new AdditionalLicenceConditions({}, application), 'dashboard')
  itShouldHaveNextValue(new AdditionalLicenceConditions({}, application), '')

  describe('errors', () => {
    it('returns an empty object if the conditions array is empty', () => {
      const page = new AdditionalLicenceConditions({ conditions: [] }, application)
      expect(page.errors()).toEqual({})
    })

    it('returns an empty object if the conditions array is undefined', () => {
      const page = new AdditionalLicenceConditions({ conditions: undefined }, application)
      expect(page.errors()).toEqual({})
    })

    it('returns an empty object if the conditions array is populated and the associated details are present', () => {
      const page = new AdditionalLicenceConditions(body, application)
      expect(page.errors()).toEqual({})
    })

    it('returns errors if the conditions array is populated but the associated details are not present', () => {
      const page = new AdditionalLicenceConditions(
        { conditions: ['curfew' as const, 'exclusionZone' as const, 'programmes'] },
        application,
      )
      expect(page.errors()).toEqual({
        curfewDetail: 'You must provide details about curfew conditions',
        exclusionZoneDetail: 'You must provide details about the exclusion zone',
        programmesDetail: 'You must provide details about programme or activity conditions',
      })
    })
  })

  describe('response', () => {
    it('returns a translated version of the response', () => {
      const page = new AdditionalLicenceConditions(body, application)
      expect(page.response()).toEqual({
        Curfew: 'Curfew detail',
        'Exclusion zone': 'Exclusion zone detail',
        'Participate or co-operate with programmes or activities': 'Programmes detail',
      })
    })
  })

  describe('items', () => {
    it('returns radio button items with any additional condition detail text', () => {
      const page = new AdditionalLicenceConditions(body, application)
      expect(page.items()).toEqual(
        expect.arrayContaining([
          { value: 'alcoholMonitoring', text: 'Alcohol monitoring' },
          { value: 'civilOrders', text: 'Civil orders / SHPT / restraining, criminal behaviour orders' },
          {
            value: 'exclusionZone',
            text: 'Exclusion zone',
            detailLabel: 'Provide details about the exclusion zone',
            detailHint: 'You must ensure that the exclusion zone map is on NDelius.',
          },
          { value: 'nonAssociation', text: 'Non association' },
        ]),
      )
    })
  })
})
