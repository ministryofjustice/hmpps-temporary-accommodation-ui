import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import type { PremisesSearchParameters } from '@approved-premises/ui'
import type { Cas3PremisesSearchResult, Cas3PremisesStatus } from '@approved-premises/api'
import { CallConfig } from '../../../../data/restClient'
import PremisesService from '../../../../services/v2/premisesService'
import { probationRegionFactory } from '../../../../testutils/factories'
import extractCallConfig from '../../../../utils/restUtils'
import PremisesController from './premisesController'

jest.mock('../../../../utils/validation')
jest.mock('../../../../utils/restUtils')
jest.mock('../../../../utils/premisesUtils', () => {
  const originalModule = jest.requireActual('../../../../utils/premisesUtils')

  return {
    ...originalModule,
    getActiveStatuses: jest.fn(),
    premisesActions: jest.fn(),
  }
})
jest.mock('../../../../utils/userUtils')
jest.mock('../../../../utils/placeUtils')

describe('PremisesController', () => {
  const callConfig = { token: 'some-call-config-token' } as CallConfig

  let request: Request

  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const premisesService = createMock<PremisesService>({})

  const premisesController = new PremisesController(premisesService)

  beforeEach(() => {
    request = createMock<Request>({
      session: {
        probationRegion: probationRegionFactory.build(),
      },
      query: {},
    })
    ;(extractCallConfig as jest.MockedFn<typeof extractCallConfig>).mockReturnValue(callConfig)
  })

  describe('index', () => {
    const premisesRow1 = [
      { html: '32 Windsor Gardens<br />London<br />W9 3RQ' },
      { html: 'No bedspaces' },
      { text: 'Hammersmith, Fulham, Kensington, Chelsea and Westminster' },
      { html: 'Manage' },
    ]
    const premisesRow2 = [
      { html: '221c Baker Street<br />London<br />NW1 6XE' },
      { html: '<a>Room 1</a><br /><a>Room 2</a>(Archived)' },
      { text: 'Hammersmith, Fulham, Kensington, Chelsea and Westminster' },
      { html: 'Manage' },
    ]
    const premisesRow3 = [
      { html: '62 West Wallaby Street<br />Wigan<br />WG7 7FU' },
      { html: '<a>Room A</a><br /><a>Room B</a>' },
      { text: 'Wigan' },
      { html: 'Manage' },
    ]

    it('redirects to include status=online when no status parameter is provided', async () => {
      request = createMock<Request>({
        session: {
          probationRegion: probationRegionFactory.build(),
        },
        query: {},
        path: '/v2/properties',
      })

      const requestHandler = premisesController.index()
      await requestHandler(request, response, next)

      expect(response.redirect).toHaveBeenCalledWith('/v2/properties?status=online')
      expect(response.render).not.toHaveBeenCalled()
      expect(premisesService.searchData).not.toHaveBeenCalled()
    })

    it('returns the search data to the template when status=online is provided', async () => {
      const params: PremisesSearchParameters & { status: Cas3PremisesStatus } = {
        postcodeOrAddress: undefined,
        status: 'online',
      }
      const searchData = {
        results: [] as Array<Cas3PremisesSearchResult>,
        totalPremises: 3,
        totalOnlineBedspaces: 5,
        totalUpcomingBedspaces: 2,
        tableRows: [premisesRow2, premisesRow1, premisesRow3],
      }

      request = createMock<Request>({
        session: {
          probationRegion: probationRegionFactory.build(),
        },
        query: params,
        path: '/v2/properties',
      })

      premisesService.searchData.mockResolvedValue(searchData)

      const requestHandler = premisesController.index()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/v2/premises/index', {
        params: { postcodeOrAddress: undefined, status: 'online' },
        status: 'online',
        isOnlineTab: true,
        isArchivedTab: false,
        ...searchData,
      })

      expect(premisesService.searchData).toHaveBeenCalledWith(callConfig, params, 'online')
    })

    it('returns the filtered search data to the template when the user has searched for a postcode or address', async () => {
      const params = { postcodeOrAddress: 'NE1', status: 'online' as Cas3PremisesStatus }
      const searchData = {
        results: [] as Array<Cas3PremisesSearchResult>,
        totalPremises: 3,
        totalOnlineBedspaces: 5,
        totalUpcomingBedspaces: 2,
        tableRows: [premisesRow2, premisesRow1, premisesRow3],
      }

      premisesService.searchData.mockResolvedValue(searchData)

      request = createMock<Request>({
        session: {
          probationRegion: probationRegionFactory.build(),
        },
        query: params,
        path: '/v2/properties',
      })

      const requestHandler = premisesController.index()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/v2/premises/index', {
        params: { postcodeOrAddress: 'NE1', status: 'online' },
        status: 'online',
        isOnlineTab: true,
        isArchivedTab: false,
        ...searchData,
      })

      expect(premisesService.searchData).toHaveBeenCalledWith(callConfig, params, 'online')
    })
  })
})
