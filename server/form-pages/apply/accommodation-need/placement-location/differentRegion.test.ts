import { createMock } from '@golevelup/ts-jest'
import { FullPerson } from '@approved-premises/api'
import { applicationFactory, referenceDataFactory } from '../../../../testutils/factories'
import { CallConfig } from '../../../../data/restClient'
import DifferentRegion, { DifferentRegionBody } from './differentRegion'
import { ReferenceDataService } from '../../../../services'
import { buildUniqueList } from '../../../../testutils/utils'

describe('DifferentRegion', () => {
  const application = applicationFactory.build()
  const regions = buildUniqueList(referenceDataFactory.probationRegion(), region => region.id, 3)
  const body: DifferentRegionBody = {
    regionId: '2',
    regionName: 'West Midlands',
    currentRegionId: '1',
    currentRegionName: 'East Midlands',
  }

  describe('initialize', () => {
    it('returns the page with all regions fetched from the API and sets current region', async () => {
      const callConfig = {
        token: 'some-token',
        probationRegion: { id: '1', name: 'East Midlands' },
      } as unknown as CallConfig
      const getProbationRegionsMock = jest.fn().mockResolvedValue(regions)
      const referenceDataService = createMock<ReferenceDataService>({
        getProbationRegions: getProbationRegionsMock,
      })

      const page = await DifferentRegion.initialize({} as DifferentRegionBody, application, callConfig, {
        referenceDataService,
      })

      expect(getProbationRegionsMock).toHaveBeenCalledWith(callConfig)
      expect(page).toBeInstanceOf(DifferentRegion)
      expect(page.regions).toEqual(regions)
      expect(page.body.currentRegionId).toEqual('1')
      expect(page.body.currentRegionName).toEqual('East Midlands')
    })

    it('clears placement-pdu when regionId changes', () => {
      application.data = {
        'placement-location': {
          'different-region': { regionId: 'old-id' },
          'placement-pdu': { some: 'value' },
        },
      }
      const page = new DifferentRegion({}, application, regions)
      page.body = { regionId: 'new-id', regionName: 'New Region' }
      expect(application.data['placement-location']['placement-pdu']).toEqual({})
    })
  })

  describe('body', () => {
    it('sets the body to the existing value', () => {
      const page = new DifferentRegion(body, application, regions)
      expect(page.body).toEqual(body)
    })

    it('sets the body based on the value submitted and the regions from the API', () => {
      const page = new DifferentRegion({}, application, regions)
      page.body = { regionId: regions[1].id }
      expect(page.body).toEqual({
        regionId: regions[1].id,
        regionName: regions[1].name,
      })
    })
  })

  describe('next', () => {
    it('returns "alternative-pdu" if the selected region is the current region', () => {
      const page = new DifferentRegion(
        {
          ...body,
          regionId: '1',
          regionName: 'East Midlands',
          currentRegionId: '1',
          currentRegionName: 'East Midlands',
        },
        application,
        regions,
      )
      expect(page.next()).toEqual('alternative-pdu')
    })

    it('returns "placement-pdu" if the selected region is not the current region', () => {
      const page = new DifferentRegion(body, application, regions)
      expect(page.next()).toEqual('placement-pdu')
    })
  })

  describe('errors', () => {
    it('returns no error if regionId is populated', () => {
      const page = new DifferentRegion(body, application, regions)
      expect(page.errors()).toEqual({})
    })

    it('returns an error if regionId is not populated', () => {
      const page = new DifferentRegion({}, application, regions)
      expect(page.errors()).toEqual({
        regionId: `Select the region ${(application.person as FullPerson).name} should be placed in`,
      })
    })
  })

  describe('response', () => {
    it('returns a translated version of the response', () => {
      const page = new DifferentRegion(body, application, regions)
      expect(page.response()).toEqual({
        'Which region should the person be placed in?': 'West Midlands',
      })
    })
  })

  describe('getAllRegions', () => {
    it('returns the regions formatted for use in a radios element, excluding the current and National', () => {
      body.regionId = regions[0].id
      body.regionName = regions[0].name
      const page = new DifferentRegion(body, application, regions)
      const renderedRegions = page.getAllRegions()
      expect(renderedRegions).toEqual([
        {
          value: regions[0].id,
          text: regions[0].name,
          checked: true,
        },
        {
          value: regions[1].id,
          text: regions[1].name,
          checked: false,
        },
        {
          value: regions[2].id,
          text: regions[2].name,
          checked: false,
        },
        { divider: 'or' },
        {
          value: '1',
          text: 'East Midlands (your region)',
          checked: false,
        },
      ])
    })
  })
})
