import { createMock } from '@golevelup/ts-jest'
import { ReferenceDataService } from 'server/services'
import { applicationFactory } from '../../../../testutils/factories'
import { itShouldHavePreviousValue } from '../../../shared-examples'
import AlternativeRegion, { AlternativeRegionBody } from './alternativeRegion'
import DifferentRegion from './differentRegion'
import { CallConfig } from '../../../../data/restClient'

describe('AlternativeRegion', () => {
  const application = applicationFactory.build()
  const body: AlternativeRegionBody = { alternativeRegion: 'yes', regionName: 'East Midlands' }

  describe('initialize', () => {
    it('returns the AlternativeRegion page', async () => {
      const callConfig = { token: 'some-token', probationRegion: { id: '1', name: 'East Midlands' } } as CallConfig
      const getProbationRegionsMock = jest.fn()
      const referenceDataService = createMock<ReferenceDataService>({
        getProbationRegions: getProbationRegionsMock,
      })

      const page = await AlternativeRegion.initialize({} as AlternativeRegionBody, application, callConfig, {
        referenceDataService,
      })

      expect(page).toBeInstanceOf(AlternativeRegion)
      expect(page.regionName).toEqual('East Midlands')
    })

    it('returns a DifferentRegion page if the user region is national', async () => {
      const callConfig = { token: 'some-token', probationRegion: { id: '1', name: 'National' } } as CallConfig
      const regions = [
        { id: '1', name: 'National' },
        { id: '2', name: 'East Midlands' },
      ]

      const getProbationRegionsMock = jest.fn().mockResolvedValue(regions)
      const referenceDataService = createMock<ReferenceDataService>({
        getProbationRegions: getProbationRegionsMock,
      })

      const page = await AlternativeRegion.initialize({} as AlternativeRegionBody, application, callConfig, {
        referenceDataService,
      })

      expect(getProbationRegionsMock).toHaveBeenCalledWith(callConfig)
      expect(page).toBeInstanceOf(DifferentRegion)
      if ('regions' in page) {
        expect(page.regions).toEqual(regions)
      }
    })
  })

  describe('body', () => {
    it('sets the body to the existing value', () => {
      const page = new AlternativeRegion(body, application, 'East Midlands')
      expect(page.body).toEqual(body)
    })

    it('sets the body based on the value submitted', () => {
      const page = new AlternativeRegion({}, application, 'East Midlands')
      page.body = { alternativeRegion: 'no' }
      expect(page.body).toEqual({
        alternativeRegion: 'no',
        regionName: 'East Midlands',
      })
    })
  })

  itShouldHavePreviousValue(new AlternativeRegion({}, application, 'East Midlands'), 'dashboard')

  describe('next', () => {
    it('returns "alternative-pdu" if the answer is yes', () => {
      const page = new AlternativeRegion(
        { alternativeRegion: 'yes', regionName: 'East Midlands' },
        application,
        'East Midlands',
      )
      expect(page.next()).toEqual('alternative-pdu')
    })

    it('returns "different-region" if the answer is no', () => {
      const page = new AlternativeRegion(
        { alternativeRegion: 'no', regionName: 'East Midlands' },
        application,
        'East Midlands',
      )
      expect(page.next()).toEqual('different-region')
    })

    it('returns "different-region" if the region is National', () => {
      const page = new AlternativeRegion({ alternativeRegion: 'yes', regionName: 'National' }, application, 'National')
      expect(page.next()).toEqual('different-region')
    })
  })

  describe('errors', () => {
    it('returns no error if alternativeRegion is populated', () => {
      const page = new AlternativeRegion(body, application, 'East Midlands')
      expect(page.errors()).toEqual({})
    })

    it('returns an error if alternativeRegion is not populated', () => {
      const page = new AlternativeRegion({ regionName: 'East Midlands' }, application, 'East Midlands')
      expect(page.errors()).toEqual({
        alternativeRegion: 'Select if the placement is for the East Midlands region',
      })
    })
  })

  describe('response', () => {
    it('returns a translated version of the response when answered yes', () => {
      const page = new AlternativeRegion(
        { alternativeRegion: 'yes', regionName: 'East Midlands' },
        application,
        'East Midlands',
      )
      expect(page.response()).toEqual({
        'Is the placement for the East Midlands region?': 'Yes, East Midlands',
      })
    })

    it('returns a translated version of the response when answered no', () => {
      const page = new AlternativeRegion(
        { alternativeRegion: 'no', regionName: 'East Midlands' },
        application,
        'East Midlands',
      )
      expect(page.response()).toEqual({
        'Is the placement for the East Midlands region?': 'No, a different region',
      })
    })

    it('returns an empty object if the region is National', () => {
      const page = new AlternativeRegion({ alternativeRegion: 'yes', regionName: 'National' }, application, 'National')
      expect(page.response()).toEqual({})
    })
  })
})
