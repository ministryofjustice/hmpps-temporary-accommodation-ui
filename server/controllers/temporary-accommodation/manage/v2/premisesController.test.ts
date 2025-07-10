import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import type { PremisesSearchParameters, SummaryList } from '@approved-premises/ui'
import type { Cas3PremisesSearchResult } from '@approved-premises/api'
import { CallConfig } from '../../../../data/restClient'
import PremisesService from '../../../../services/v2/premisesService'
import { cas3PremisesFactory, probationRegionFactory } from '../../../../testutils/factories'
import extractCallConfig from '../../../../utils/restUtils'
import PremisesController from './premisesController'
import paths from '../../../../paths/temporary-accommodation/manage'

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

    it('searches online premises data and returns as table rows when no status parameter is provided', async () => {
      const params: PremisesSearchParameters = {
        postcodeOrAddress: undefined,
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
        path: '/v2/properties/online',
      })

      premisesService.searchDataAndGenerateTableRows.mockResolvedValue(searchData)

      const requestHandler = premisesController.index('online')
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/v2/premises/index', {
        params: { postcodeOrAddress: undefined },
        status: 'online',
        subNavArr: [
          { text: 'Online properties', href: '/v2/properties/online', active: true },
          { text: 'Archived properties', href: '/v2/properties/archived', active: false },
        ],
        ...searchData,
      })

      expect(premisesService.searchDataAndGenerateTableRows).toHaveBeenCalledWith(
        callConfig,
        params.postcodeOrAddress,
        'online',
      )
    })

    it('searches online premises data and returns as table rows when status=online parameter is provided', async () => {
      const params: PremisesSearchParameters = {
        postcodeOrAddress: undefined,
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
        path: '/v2/properties/online',
      })

      premisesService.searchDataAndGenerateTableRows.mockResolvedValue(searchData)

      const requestHandler = premisesController.index('online')
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/v2/premises/index', {
        params: { postcodeOrAddress: undefined },
        status: 'online',
        subNavArr: [
          { text: 'Online properties', href: '/v2/properties/online', active: true },
          { text: 'Archived properties', href: '/v2/properties/archived', active: false },
        ],
        ...searchData,
      })

      expect(premisesService.searchDataAndGenerateTableRows).toHaveBeenCalledWith(
        callConfig,
        params.postcodeOrAddress,
        'online',
      )
    })

    it('searches online premises data by postcode or address and returns as table rows when searched for a postcode or address', async () => {
      const params = { postcodeOrAddress: 'NE1' }
      const searchData = {
        results: [] as Array<Cas3PremisesSearchResult>,
        totalPremises: 3,
        totalOnlineBedspaces: 5,
        totalUpcomingBedspaces: 2,
        tableRows: [premisesRow2, premisesRow1, premisesRow3],
      }

      premisesService.searchDataAndGenerateTableRows.mockResolvedValue(searchData)

      request = createMock<Request>({
        session: {
          probationRegion: probationRegionFactory.build(),
        },
        query: params,
        path: '/v2/properties/online',
      })

      const requestHandler = premisesController.index('online')
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/v2/premises/index', {
        params: { postcodeOrAddress: 'NE1' },
        status: 'online',
        subNavArr: [
          { text: 'Online properties', href: '/v2/properties/online?postcodeOrAddress=NE1', active: true },
          { text: 'Archived properties', href: '/v2/properties/archived?postcodeOrAddress=NE1', active: false },
        ],
        ...searchData,
      })

      expect(premisesService.searchDataAndGenerateTableRows).toHaveBeenCalledWith(
        callConfig,
        params.postcodeOrAddress,
        'online',
      )
    })

    it('returns empty search data when there are no properties in the database', async () => {
      const params: PremisesSearchParameters = {
        postcodeOrAddress: undefined,
      }
      const searchData = {
        results: [] as Array<Cas3PremisesSearchResult>,
        totalPremises: 0,
        totalOnlineBedspaces: 0,
        totalUpcomingBedspaces: 0,
        tableRows: [] as Array<never>,
      }

      request = createMock<Request>({
        session: {
          probationRegion: probationRegionFactory.build(),
        },
        query: params,
        path: '/v2/properties/online',
      })

      premisesService.searchDataAndGenerateTableRows.mockResolvedValue(searchData)

      const requestHandler = premisesController.index('online')
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/v2/premises/index', {
        params: { postcodeOrAddress: undefined },
        status: 'online',
        subNavArr: [
          { text: 'Online properties', href: '/v2/properties/online', active: true },
          { text: 'Archived properties', href: '/v2/properties/archived', active: false },
        ],
        ...searchData,
      })

      expect(premisesService.searchDataAndGenerateTableRows).toHaveBeenCalledWith(
        callConfig,
        params.postcodeOrAddress,
        'online',
      )
    })

    it('returns zero online properties data when no properties exist in database', async () => {
      const params: PremisesSearchParameters = {
        postcodeOrAddress: undefined,
      }
      const searchData = {
        results: [] as Array<Cas3PremisesSearchResult>,
        totalPremises: 0,
        totalOnlineBedspaces: 0,
        totalUpcomingBedspaces: 0,
        tableRows: [] as Array<never>,
      }

      request = createMock<Request>({
        session: {
          probationRegion: probationRegionFactory.build(),
        },
        query: params,
        path: '/v2/properties/online',
      })

      premisesService.searchDataAndGenerateTableRows.mockResolvedValue(searchData)

      const requestHandler = premisesController.index('online')
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/v2/premises/index', {
        params: { postcodeOrAddress: undefined },
        status: 'online',
        subNavArr: [
          { text: 'Online properties', href: '/v2/properties/online', active: true },
          { text: 'Archived properties', href: '/v2/properties/archived', active: false },
        ],
        totalPremises: 0,
        totalOnlineBedspaces: 0,
        totalUpcomingBedspaces: 0,
        results: [],
        tableRows: [],
      })

      expect(premisesService.searchDataAndGenerateTableRows).toHaveBeenCalledWith(
        callConfig,
        params.postcodeOrAddress,
        'online',
      )
    })

    it('returns online properties data with search term and bedspace counts when search has results', async () => {
      const params = { postcodeOrAddress: 'NE1' }
      const searchData = {
        results: [] as Array<Cas3PremisesSearchResult>,
        totalPremises: 2,
        totalOnlineBedspaces: 8,
        totalUpcomingBedspaces: 3,
        tableRows: [premisesRow1, premisesRow2],
      }

      request = createMock<Request>({
        session: {
          probationRegion: probationRegionFactory.build(),
        },
        query: params,
        path: '/v2/properties/online',
      })

      premisesService.searchDataAndGenerateTableRows.mockResolvedValue(searchData)

      const requestHandler = premisesController.index('online')
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/v2/premises/index', {
        params: { postcodeOrAddress: 'NE1' },
        status: 'online',
        subNavArr: [
          { text: 'Online properties', href: '/v2/properties/online?postcodeOrAddress=NE1', active: true },
          { text: 'Archived properties', href: '/v2/properties/archived?postcodeOrAddress=NE1', active: false },
        ],
        totalPremises: 2,
        totalOnlineBedspaces: 8,
        totalUpcomingBedspaces: 3,
        results: [],
        tableRows: [premisesRow1, premisesRow2],
      })

      expect(premisesService.searchDataAndGenerateTableRows).toHaveBeenCalledWith(
        callConfig,
        params.postcodeOrAddress,
        'online',
      )
    })

    it('returns zero online properties data with search term when search returns no results', async () => {
      const params = { postcodeOrAddress: 'NONEXISTENT' }
      const searchData = {
        results: [] as Array<Cas3PremisesSearchResult>,
        totalPremises: 0,
        totalOnlineBedspaces: 0,
        totalUpcomingBedspaces: 0,
        tableRows: [] as Array<never>,
      }

      request = createMock<Request>({
        session: {
          probationRegion: probationRegionFactory.build(),
        },
        query: params,
        path: '/v2/properties/online',
      })

      premisesService.searchDataAndGenerateTableRows.mockResolvedValue(searchData)

      const requestHandler = premisesController.index('online')
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/v2/premises/index', {
        params: { postcodeOrAddress: 'NONEXISTENT' },
        status: 'online',
        subNavArr: [
          { text: 'Online properties', href: '/v2/properties/online?postcodeOrAddress=NONEXISTENT', active: true },
          { text: 'Archived properties', href: '/v2/properties/archived?postcodeOrAddress=NONEXISTENT', active: false },
        ],
        totalPremises: 0,
        totalOnlineBedspaces: 0,
        totalUpcomingBedspaces: 0,
        results: [],
        tableRows: [],
      })

      expect(premisesService.searchDataAndGenerateTableRows).toHaveBeenCalledWith(
        callConfig,
        params.postcodeOrAddress,
        'online',
      )
    })

    it('returns zero archived properties data when no archived properties exist in database', async () => {
      const params: PremisesSearchParameters = {
        postcodeOrAddress: undefined,
      }
      const searchData = {
        results: [] as Array<Cas3PremisesSearchResult>,
        totalPremises: 0,
        totalOnlineBedspaces: 0,
        totalUpcomingBedspaces: 0,
        tableRows: [] as Array<never>,
      }

      request = createMock<Request>({
        session: {
          probationRegion: probationRegionFactory.build(),
        },
        query: params,
        path: '/v2/properties/archived',
      })

      premisesService.searchDataAndGenerateTableRows.mockResolvedValue(searchData)

      const requestHandler = premisesController.index('archived')
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/v2/premises/index', {
        params: { postcodeOrAddress: undefined },
        status: 'archived',
        subNavArr: [
          { text: 'Online properties', href: '/v2/properties/online', active: false },
          { text: 'Archived properties', href: '/v2/properties/archived', active: true },
        ],
        totalPremises: 0,
        totalOnlineBedspaces: 0,
        totalUpcomingBedspaces: 0,
        results: [],
        tableRows: [],
      })

      expect(premisesService.searchDataAndGenerateTableRows).toHaveBeenCalledWith(
        callConfig,
        params.postcodeOrAddress,
        'archived',
      )
    })

    it('returns archived properties data with search term when search has results', async () => {
      const params = { postcodeOrAddress: 'SW1' }
      const searchData = {
        results: [] as Array<Cas3PremisesSearchResult>,
        totalPremises: 3,
        totalOnlineBedspaces: 0,
        totalUpcomingBedspaces: 0,
        tableRows: [premisesRow1, premisesRow2, premisesRow3],
      }

      request = createMock<Request>({
        session: {
          probationRegion: probationRegionFactory.build(),
        },
        query: params,
        path: '/v2/properties/archived',
      })

      premisesService.searchDataAndGenerateTableRows.mockResolvedValue(searchData)

      const requestHandler = premisesController.index('archived')
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/v2/premises/index', {
        params: { postcodeOrAddress: 'SW1' },
        status: 'archived',
        subNavArr: [
          { text: 'Online properties', href: '/v2/properties/online?postcodeOrAddress=SW1', active: false },
          { text: 'Archived properties', href: '/v2/properties/archived?postcodeOrAddress=SW1', active: true },
        ],
        totalPremises: 3,
        totalOnlineBedspaces: 0,
        totalUpcomingBedspaces: 0,
        results: [],
        tableRows: [premisesRow1, premisesRow2, premisesRow3],
      })

      expect(premisesService.searchDataAndGenerateTableRows).toHaveBeenCalledWith(
        callConfig,
        params.postcodeOrAddress,
        'archived',
      )
    })

    it('returns zero archived properties data with search term when search returns no results', async () => {
      const params = { postcodeOrAddress: 'NOTFOUND' }
      const searchData = {
        results: [] as Array<Cas3PremisesSearchResult>,
        totalPremises: 0,
        totalOnlineBedspaces: 0,
        totalUpcomingBedspaces: 0,
        tableRows: [] as Array<never>,
      }

      request = createMock<Request>({
        session: {
          probationRegion: probationRegionFactory.build(),
        },
        query: params,
        path: '/v2/properties/archived',
      })

      premisesService.searchDataAndGenerateTableRows.mockResolvedValue(searchData)

      const requestHandler = premisesController.index('archived')
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/v2/premises/index', {
        params: { postcodeOrAddress: 'NOTFOUND' },
        status: 'archived',
        subNavArr: [
          { text: 'Online properties', href: '/v2/properties/online?postcodeOrAddress=NOTFOUND', active: false },
          { text: 'Archived properties', href: '/v2/properties/archived?postcodeOrAddress=NOTFOUND', active: true },
        ],
        totalPremises: 0,
        totalOnlineBedspaces: 0,
        totalUpcomingBedspaces: 0,
        results: [],
        tableRows: [],
      })

      expect(premisesService.searchDataAndGenerateTableRows).toHaveBeenCalledWith(
        callConfig,
        params.postcodeOrAddress,
        'archived',
      )
    })
  })

  describe('show', () => {
    const property = cas3PremisesFactory.build({ status: 'online', startDate: '2025-02-01' })

    const summaryList: SummaryList = {
      rows: [
        {
          key: { text: 'Property status' },
          value: { html: `<strong class="govuk-tag govuk-tag--green">Online</strong>` },
        },
        {
          key: { text: 'Start date' },
          value: { text: '1 February 2025' },
        },
        {
          key: { text: 'Address' },
          value: {
            html: `${property.addressLine1}<br />${property.addressLine2}<br />${property.town}<br />${property.postcode}`,
          },
        },
        {
          key: { text: 'Local authority' },
          value: { text: property.localAuthorityArea.name },
        },
        {
          key: { text: 'Probation region' },
          value: { text: property.probationRegion.name },
        },
        {
          key: { text: 'Probation delivery unit' },
          value: { text: property.probationDeliveryUnit.name },
        },
        {
          key: { text: 'Expected turn around time' },
          value: { text: `${property.turnaroundWorkingDays} working days` },
        },
        {
          key: { text: 'Property details' },
          value: {
            html: property.characteristics.map(char => `<span class="hmpps-tag-filters">${char.name}</span>`).join(' '),
          },
        },
        {
          key: { text: 'Additional property details' },
          value: { text: property.notes },
        },
      ],
    }

    const navArr = [
      {
        text: 'Property overview',
        href: paths.premises.v2.show({ premisesId: property.id }),
        active: true,
      },
      {
        text: 'Bedspaces overview',
        href: '#',
        active: false,
      },
    ]

    it('shows an online premises', async () => {
      request = createMock<Request>({
        session: { probationRegion: probationRegionFactory.build() },
        url: `/v2/properties/${property.id}`,
        params: { premisesId: property.id },
      })

      premisesService.getSinglePremises.mockResolvedValue(property)
      premisesService.summaryList.mockReturnValue(summaryList)

      const requestHandler = premisesController.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/v2/premises/show', {
        premises: property,
        summary: summaryList,
        actions: [],
        subNavArr: navArr,
      })

      expect(premisesService.getSinglePremises).toHaveBeenCalledWith(callConfig, property.id)
      expect(premisesService.summaryList).toHaveBeenCalledWith(property)
    })
  })
})
