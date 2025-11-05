import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import { ErrorsAndUserInput, PremisesShowTabs, SummaryList } from '@approved-premises/ui'
import type { Cas3Premises } from '@approved-premises/api'
import { CallConfig } from '../../../data/restClient'
import PremisesService from '../../../services/premisesService'
import {
  assessmentFactory,
  cas3BedspaceFactory,
  cas3BedspacesFactory,
  cas3BedspacesReferenceFactory,
  cas3NewPremisesFactory,
  cas3PremisesFactory,
  cas3PremisesSearchResultFactory,
  cas3PremisesSearchResultsFactory,
  cas3ReferenceDataFactory,
  cas3UpdatePremisesFactory,
  placeContextFactory,
  probationRegionFactory,
  referenceDataFactory,
} from '../../../testutils/factories'
import extractCallConfig from '../../../utils/restUtils'
import PremisesController from './premisesController'
import { filterProbationRegions } from '../../../utils/userUtils'
import {
  catchValidationErrorOrPropogate,
  fetchErrorsAndUserInput,
  generateErrorMessages,
  generateErrorSummary,
  generateMergeParameters,
} from '../../../utils/validation'
import BedspaceService from '../../../services/bedspaceService'
import { DateFormats } from '../../../utils/dateUtils'
import * as premisesUtils from '../../../utils/premisesUtils'
import * as bedspaceUtils from '../../../utils/bedspaceUtils'
import { AssessmentsService } from '../../../services'
import cas3BedspaceReferenceFactory from '../../../testutils/factories/cas3BedspaceReference'
import { tableRows } from '../../../utils/premisesUtils'

jest.mock('../../../utils/validation')
jest.mock('../../../utils/restUtils')
jest.mock('../../../utils/userUtils')

describe('PremisesController', () => {
  const callConfig = { token: 'some-call-config-token' } as CallConfig

  const displayedCharacteristics = [
    cas3ReferenceDataFactory.build({ description: 'Ground floor' }),
    cas3ReferenceDataFactory.build({ description: 'Shared kitchen' }),
  ]
  const referenceData = {
    localAuthorities: referenceDataFactory.localAuthority().buildList(5),
    characteristics: [...displayedCharacteristics, cas3ReferenceDataFactory.build({ description: 'Other' })],
    probationRegions: referenceDataFactory.probationRegion().buildList(5),
    pdus: referenceDataFactory.pdu().buildList(5),
  }

  const filteredRegions = [
    probationRegionFactory.build({
      name: 'filtered-region',
    }),
  ]
  const assessment = assessmentFactory.build({ status: 'ready_to_place' })
  const placeContext = placeContextFactory.build({ assessment })
  const placeContextQueryString = `placeContextAssessmentId=${placeContext.assessment.id}&placeContextArrivalDate=${placeContext.arrivalDate}`

  let request: Request

  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const premisesService = createMock<PremisesService>({})
  const bedspaceService = createMock<BedspaceService>({})
  const assessmentService = createMock<AssessmentsService>({})

  const premisesController = new PremisesController(premisesService, bedspaceService, assessmentService)

  beforeEach(() => {
    jest.clearAllMocks()
    request = createMock<Request>({
      session: {
        probationRegion: probationRegionFactory.build(),
      },
      query: {},
    })
    ;(extractCallConfig as jest.MockedFn<typeof extractCallConfig>).mockReturnValue(callConfig)
    assessmentService.findAssessment.mockResolvedValue(assessment)

    jest.spyOn(premisesUtils, 'tableRows')
    jest.spyOn(premisesUtils, 'summaryList')
  })

  describe('index', () => {
    it('searches online premises data and returns as table rows when no status parameter is provided', async () => {
      const postcodeOrAddress: string = undefined
      const params = {
        postcodeOrAddress,
        placeContextAssessmentId: placeContext.assessment.id,
        placeContextArrivalDate: placeContext.arrivalDate,
      }
      const searchData = cas3PremisesSearchResultsFactory.build({
        results: cas3PremisesSearchResultFactory.buildList(3),
        totalPremises: 3,
        totalOnlineBedspaces: 5,
        totalUpcomingBedspaces: 2,
      })

      request = createMock<Request>({
        session: {
          probationRegion: probationRegionFactory.build(),
        },
        query: params,
        path: '/properties/online',
      })

      premisesService.search.mockResolvedValue(searchData)

      const requestHandler = premisesController.index('online')
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/premises/index', {
        params,
        status: 'online',
        premisesSortBy: 'pdu',
        subNavArr: [
          {
            text: 'Online properties',
            href: `/properties/online?placeContextAssessmentId=${placeContext.assessment.id}&placeContextArrivalDate=${placeContext.arrivalDate}`,
            active: true,
          },
          {
            text: 'Archived properties',
            href: `/properties/archived?placeContextAssessmentId=${placeContext.assessment.id}&placeContextArrivalDate=${placeContext.arrivalDate}`,
            active: false,
          },
        ],
        ...searchData,
        tableRows: tableRows(searchData, placeContext, 'online', 'pdu'),
      })
      expect(premisesService.search).toHaveBeenCalledWith(callConfig, params.postcodeOrAddress, 'online')
    })

    it('searches online premises data and returns as table rows when status=online parameter is provided', async () => {
      const postcodeOrAddress: string | undefined = undefined
      const params = {
        postcodeOrAddress,
        placeContextAssessmentId: placeContext.assessment.id,
        placeContextArrivalDate: placeContext.arrivalDate,
      }
      const searchData = cas3PremisesSearchResultsFactory.build({
        results: cas3PremisesSearchResultFactory.buildList(3),
        totalPremises: 3,
        totalOnlineBedspaces: 5,
        totalUpcomingBedspaces: 2,
      })

      request = createMock<Request>({
        session: {
          probationRegion: probationRegionFactory.build(),
        },
        query: params,
        path: '/properties/online',
      })

      premisesService.search.mockResolvedValue(searchData)

      const requestHandler = premisesController.index('online')
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/premises/index', {
        params,
        status: 'online',
        premisesSortBy: 'pdu',
        subNavArr: [
          {
            text: 'Online properties',
            href: `/properties/online?placeContextAssessmentId=${placeContext.assessment.id}&placeContextArrivalDate=${placeContext.arrivalDate}`,
            active: true,
          },
          {
            text: 'Archived properties',
            href: `/properties/archived?placeContextAssessmentId=${placeContext.assessment.id}&placeContextArrivalDate=${placeContext.arrivalDate}`,
            active: false,
          },
        ],
        ...searchData,
        tableRows: tableRows(searchData, placeContext, 'online', 'pdu'),
      })

      expect(premisesService.search).toHaveBeenCalledWith(callConfig, params.postcodeOrAddress, 'online')
    })

    it('searches online premises data by postcode or address and returns as table rows when searched for a postcode or address', async () => {
      const params = {
        postcodeOrAddress: 'NE1',
        placeContextAssessmentId: placeContext.assessment.id,
        placeContextArrivalDate: placeContext.arrivalDate,
      }
      const searchData = cas3PremisesSearchResultsFactory.build({
        results: cas3PremisesSearchResultFactory.buildList(3),
        totalPremises: 3,
        totalOnlineBedspaces: 5,
        totalUpcomingBedspaces: 2,
      })

      premisesService.search.mockResolvedValue(searchData)

      request = createMock<Request>({
        session: {
          probationRegion: probationRegionFactory.build(),
        },
        query: params,
        path: '/properties/online',
      })

      const requestHandler = premisesController.index('online')
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/premises/index', {
        params,
        status: 'online',
        premisesSortBy: 'pdu',
        subNavArr: [
          {
            text: 'Online properties',
            href: `/properties/online?postcodeOrAddress=NE1&placeContextAssessmentId=${placeContext.assessment.id}&placeContextArrivalDate=${placeContext.arrivalDate}`,
            active: true,
          },
          {
            text: 'Archived properties',
            href: `/properties/archived?postcodeOrAddress=NE1&placeContextAssessmentId=${placeContext.assessment.id}&placeContextArrivalDate=${placeContext.arrivalDate}`,
            active: false,
          },
        ],
        ...searchData,
        tableRows: tableRows(searchData, placeContext, 'online', 'pdu'),
      })

      expect(premisesService.search).toHaveBeenCalledWith(callConfig, params.postcodeOrAddress, 'online')
    })

    it('returns empty search data when there are no properties in the database', async () => {
      const postcodeOrAddress: string | undefined = undefined
      const params = {
        postcodeOrAddress,
        placeContextAssessmentId: placeContext.assessment.id,
        placeContextArrivalDate: placeContext.arrivalDate,
      }
      const searchData = cas3PremisesSearchResultsFactory.build({
        results: [],
        totalPremises: 0,
        totalOnlineBedspaces: 0,
        totalUpcomingBedspaces: 0,
      })

      request = createMock<Request>({
        session: {
          probationRegion: probationRegionFactory.build(),
        },
        query: params,
        path: '/properties/online',
      })

      premisesService.search.mockResolvedValue(searchData)

      const requestHandler = premisesController.index('online')
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/premises/index', {
        params,
        status: 'online',
        premisesSortBy: 'pdu',
        subNavArr: [
          {
            text: 'Online properties',
            href: `/properties/online?placeContextAssessmentId=${placeContext.assessment.id}&placeContextArrivalDate=${placeContext.arrivalDate}`,
            active: true,
          },
          {
            text: 'Archived properties',
            href: `/properties/archived?placeContextAssessmentId=${placeContext.assessment.id}&placeContextArrivalDate=${placeContext.arrivalDate}`,
            active: false,
          },
        ],
        ...searchData,
        tableRows: [],
      })

      expect(premisesService.search).toHaveBeenCalledWith(callConfig, params.postcodeOrAddress, 'online')
    })

    it('returns zero online properties data when no properties exist in database', async () => {
      const postcodeOrAddress: string | undefined = undefined
      const params = {
        postcodeOrAddress,
        placeContextAssessmentId: placeContext.assessment.id,
        placeContextArrivalDate: placeContext.arrivalDate,
      }
      const searchData = cas3PremisesSearchResultsFactory.build({
        results: [],
        totalPremises: 0,
        totalOnlineBedspaces: 0,
        totalUpcomingBedspaces: 0,
      })

      request = createMock<Request>({
        session: {
          probationRegion: probationRegionFactory.build(),
        },
        query: params,
        path: '/properties/online',
      })

      premisesService.search.mockResolvedValue(searchData)

      const requestHandler = premisesController.index('online')
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/premises/index', {
        params,
        status: 'online',
        premisesSortBy: 'pdu',
        subNavArr: [
          {
            text: 'Online properties',
            href: `/properties/online?placeContextAssessmentId=${placeContext.assessment.id}&placeContextArrivalDate=${placeContext.arrivalDate}`,
            active: true,
          },
          {
            text: 'Archived properties',
            href: `/properties/archived?placeContextAssessmentId=${placeContext.assessment.id}&placeContextArrivalDate=${placeContext.arrivalDate}`,
            active: false,
          },
        ],
        totalPremises: 0,
        totalOnlineBedspaces: 0,
        totalUpcomingBedspaces: 0,
        results: [],
        tableRows: [],
      })

      expect(premisesService.search).toHaveBeenCalledWith(callConfig, params.postcodeOrAddress, 'online')
    })

    it('returns online properties data with search term and bedspace counts when search has results', async () => {
      const params = {
        postcodeOrAddress: 'NE1',
        placeContextAssessmentId: placeContext.assessment.id,
        placeContextArrivalDate: placeContext.arrivalDate,
      }
      const searchData = cas3PremisesSearchResultsFactory.build({
        results: cas3PremisesSearchResultFactory.buildList(2),
        totalPremises: 2,
        totalOnlineBedspaces: 8,
        totalUpcomingBedspaces: 3,
      })

      request = createMock<Request>({
        session: {
          probationRegion: probationRegionFactory.build(),
        },
        query: params,
        path: '/properties/online',
      })

      premisesService.search.mockResolvedValue(searchData)

      const requestHandler = premisesController.index('online')
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/premises/index', {
        params,
        status: 'online',
        premisesSortBy: 'pdu',
        subNavArr: [
          {
            text: 'Online properties',
            href: `/properties/online?postcodeOrAddress=NE1&placeContextAssessmentId=${placeContext.assessment.id}&placeContextArrivalDate=${placeContext.arrivalDate}`,
            active: true,
          },
          {
            text: 'Archived properties',
            href: `/properties/archived?postcodeOrAddress=NE1&placeContextAssessmentId=${placeContext.assessment.id}&placeContextArrivalDate=${placeContext.arrivalDate}`,
            active: false,
          },
        ],
        ...searchData,
        tableRows: tableRows(searchData, placeContext, 'online', 'pdu'),
      })

      expect(premisesService.search).toHaveBeenCalledWith(callConfig, params.postcodeOrAddress, 'online')
    })

    it('returns zero online properties data with search term when search returns no results', async () => {
      const params = {
        postcodeOrAddress: 'NONEXISTENT',
        placeContextAssessmentId: placeContext.assessment.id,
        placeContextArrivalDate: placeContext.arrivalDate,
      }
      const searchData = cas3PremisesSearchResultsFactory.build({
        results: [],
        totalPremises: 0,
        totalOnlineBedspaces: 0,
        totalUpcomingBedspaces: 0,
      })

      request = createMock<Request>({
        session: {
          probationRegion: probationRegionFactory.build(),
        },
        query: params,
        path: '/properties/online',
      })

      premisesService.search.mockResolvedValue(searchData)

      const requestHandler = premisesController.index('online')
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/premises/index', {
        params,
        status: 'online',
        premisesSortBy: 'pdu',
        subNavArr: [
          {
            text: 'Online properties',
            href: `/properties/online?postcodeOrAddress=NONEXISTENT&placeContextAssessmentId=${placeContext.assessment.id}&placeContextArrivalDate=${placeContext.arrivalDate}`,
            active: true,
          },
          {
            text: 'Archived properties',
            href: `/properties/archived?postcodeOrAddress=NONEXISTENT&placeContextAssessmentId=${placeContext.assessment.id}&placeContextArrivalDate=${placeContext.arrivalDate}`,
            active: false,
          },
        ],
        totalPremises: 0,
        totalOnlineBedspaces: 0,
        totalUpcomingBedspaces: 0,
        results: [],
        tableRows: [],
      })

      expect(premisesService.search).toHaveBeenCalledWith(callConfig, params.postcodeOrAddress, 'online')
    })

    it('returns zero archived properties data when no archived properties exist in database', async () => {
      const postcodeOrAddress: string | undefined = undefined
      const params = {
        postcodeOrAddress,
        placeContextAssessmentId: placeContext.assessment.id,
        placeContextArrivalDate: placeContext.arrivalDate,
      }
      const searchData = cas3PremisesSearchResultsFactory.build({
        results: [],
        totalPremises: 0,
        totalOnlineBedspaces: 0,
        totalUpcomingBedspaces: 0,
      })

      request = createMock<Request>({
        session: {
          probationRegion: probationRegionFactory.build(),
        },
        query: params,
        path: '/properties/archived',
      })

      premisesService.search.mockResolvedValue(searchData)

      const requestHandler = premisesController.index('archived')
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/premises/index', {
        params,
        status: 'archived',
        premisesSortBy: 'pdu',
        subNavArr: [
          {
            text: 'Online properties',
            href: `/properties/online?placeContextAssessmentId=${placeContext.assessment.id}&placeContextArrivalDate=${placeContext.arrivalDate}`,
            active: false,
          },
          {
            text: 'Archived properties',
            href: `/properties/archived?placeContextAssessmentId=${placeContext.assessment.id}&placeContextArrivalDate=${placeContext.arrivalDate}`,
            active: true,
          },
        ],
        totalPremises: 0,
        totalOnlineBedspaces: 0,
        totalUpcomingBedspaces: 0,
        results: [],
        tableRows: [],
      })

      expect(premisesService.search).toHaveBeenCalledWith(callConfig, params.postcodeOrAddress, 'archived')
    })

    it('returns archived properties data with search term when search has results', async () => {
      const params = {
        postcodeOrAddress: 'SW1',
        placeContextAssessmentId: placeContext.assessment.id,
        placeContextArrivalDate: placeContext.arrivalDate,
      }
      const searchData = cas3PremisesSearchResultsFactory.build({
        results: cas3PremisesSearchResultFactory.buildList(3),
        totalPremises: 3,
        totalOnlineBedspaces: 0,
        totalUpcomingBedspaces: 0,
      })

      request = createMock<Request>({
        session: {
          probationRegion: probationRegionFactory.build(),
        },
        query: params,
        path: '/properties/archived',
      })

      premisesService.search.mockResolvedValue(searchData)

      const requestHandler = premisesController.index('archived')
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/premises/index', {
        params,
        status: 'archived',
        premisesSortBy: 'pdu',
        subNavArr: [
          {
            text: 'Online properties',
            href: `/properties/online?postcodeOrAddress=SW1&placeContextAssessmentId=${placeContext.assessment.id}&placeContextArrivalDate=${placeContext.arrivalDate}`,
            active: false,
          },
          {
            text: 'Archived properties',
            href: `/properties/archived?postcodeOrAddress=SW1&placeContextAssessmentId=${placeContext.assessment.id}&placeContextArrivalDate=${placeContext.arrivalDate}`,
            active: true,
          },
        ],
        ...searchData,
        tableRows: tableRows(searchData, placeContext, 'archived', 'pdu'),
      })

      expect(premisesService.search).toHaveBeenCalledWith(callConfig, params.postcodeOrAddress, 'archived')
    })

    it('returns zero archived properties data with search term when search returns no results', async () => {
      const params = {
        postcodeOrAddress: 'NOTFOUND',
        placeContextAssessmentId: placeContext.assessment.id,
        placeContextArrivalDate: placeContext.arrivalDate,
      }
      const searchData = cas3PremisesSearchResultsFactory.build({
        results: [],
        totalPremises: 0,
        totalOnlineBedspaces: 0,
        totalUpcomingBedspaces: 0,
      })

      request = createMock<Request>({
        session: {
          probationRegion: probationRegionFactory.build(),
        },
        query: params,
        path: '/properties/archived',
      })

      premisesService.search.mockResolvedValue(searchData)

      const requestHandler = premisesController.index('archived')
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/premises/index', {
        params,
        status: 'archived',
        premisesSortBy: 'pdu',
        subNavArr: [
          {
            text: 'Online properties',
            href: `/properties/online?postcodeOrAddress=NOTFOUND&placeContextAssessmentId=${placeContext.assessment.id}&placeContextArrivalDate=${placeContext.arrivalDate}`,
            active: false,
          },
          {
            text: 'Archived properties',
            href: `/properties/archived?postcodeOrAddress=NOTFOUND&placeContextAssessmentId=${placeContext.assessment.id}&placeContextArrivalDate=${placeContext.arrivalDate}`,
            active: true,
          },
        ],
        totalPremises: 0,
        totalOnlineBedspaces: 0,
        totalUpcomingBedspaces: 0,
        results: [],
        tableRows: [],
      })

      expect(premisesService.search).toHaveBeenCalledWith(callConfig, params.postcodeOrAddress, 'archived')
    })
  })

  it('searches premises data and returns as table rows when premisesSortBy is "la"', async () => {
    const postcodeOrAddress: string | undefined = undefined
    const params = {
      postcodeOrAddress,
      placeContextAssessmentId: placeContext.assessment.id,
      placeContextArrivalDate: placeContext.arrivalDate,
    }
    const searchData = cas3PremisesSearchResultsFactory.build({
      results: cas3PremisesSearchResultFactory.buildList(1),
      totalPremises: 1,
      totalOnlineBedspaces: 2,
      totalUpcomingBedspaces: 0,
    })

    request = createMock<Request>({
      session: {
        probationRegion: probationRegionFactory.build(),
        premisesSortBy: 'la',
      },
      query: params,
      path: '/properties/online',
    })

    premisesService.search.mockResolvedValue(searchData)

    const requestHandler = premisesController.index('online')
    await requestHandler(request, response, next)

    expect(response.render).toHaveBeenCalledWith('temporary-accommodation/premises/index', {
      params,
      status: 'online',
      premisesSortBy: 'la',
      subNavArr: [
        {
          text: 'Online properties',
          href: `/properties/online?placeContextAssessmentId=${placeContext.assessment.id}&placeContextArrivalDate=${placeContext.arrivalDate}`,
          active: true,
        },
        {
          text: 'Archived properties',
          href: `/properties/archived?placeContextAssessmentId=${placeContext.assessment.id}&placeContextArrivalDate=${placeContext.arrivalDate}`,
          active: false,
        },
      ],
      ...searchData,
      tableRows: tableRows(searchData, placeContext, 'online', 'la'),
    })

    expect(premisesService.search).toHaveBeenCalledWith(callConfig, params.postcodeOrAddress, 'online')
  })

  describe('toggleSort', () => {
    it('toggles from pdu to la and redirects to online tab with query params when status is online', async () => {
      const req = createMock<Request>({
        session: { premisesSortBy: 'pdu' },
        query: { postcodeOrAddress: 'SW1A' },
      })
      const res = createMock<Response>({})
      res.redirect = jest.fn()

      const requestHandler = premisesController.toggleSort('online')
      await requestHandler(req, res, next)

      expect(req.session.premisesSortBy).toBe('la')
      expect(res.redirect).toHaveBeenCalledWith('/properties/online?postcodeOrAddress=SW1A')
    })

    it('toggles from la to pdu and redirects to online tab without query params when status is online', async () => {
      const req = createMock<Request>({
        session: { premisesSortBy: 'la' },
        query: {},
      })
      const res = createMock<Response>({})
      res.redirect = jest.fn()

      const requestHandler = premisesController.toggleSort('online')
      await requestHandler(req, res, next)

      expect(req.session.premisesSortBy).toBe('pdu')
      expect(res.redirect).toHaveBeenCalledWith('/properties/online')
    })

    it('defaults to pdu if session value is missing, then toggles to la and redirects to online tab when no status provided', async () => {
      const req = createMock<Request>({
        session: {},
        query: {},
      })
      const res = createMock<Response>({})
      res.redirect = jest.fn()

      const requestHandler = premisesController.toggleSort()
      await requestHandler(req, res, next)

      expect(req.session.premisesSortBy).toBe('la')
      expect(res.redirect).toHaveBeenCalledWith('/properties/online')
    })

    it('preserves query parameters when toggling sort', async () => {
      const req = createMock<Request>({
        session: { premisesSortBy: 'pdu' },
        query: { postcodeOrAddress: 'SW1A', page: '2' },
      })
      const res = createMock<Response>({})
      res.redirect = jest.fn()

      const requestHandler = premisesController.toggleSort('archived')
      await requestHandler(req, res, next)

      expect(req.session.premisesSortBy).toBe('la')
      expect(res.redirect).toHaveBeenCalledWith('/properties/archived?postcodeOrAddress=SW1A&page=2')
    })
  })

  describe('show', () => {
    const property = cas3PremisesFactory.build({ status: 'online', startDate: '2025-02-01' })
    const bedspaces = cas3BedspacesFactory.build({
      bedspaces: [
        cas3BedspaceFactory.build({ status: 'online', startDate: '2025-02-01' }),
        cas3BedspaceFactory.build({ status: 'online', startDate: '2025-02-01' }),
        cas3BedspaceFactory.build({ status: 'online', startDate: '2025-02-01' }),
      ],
      totalOnlineBedspaces: 3,
      totalUpcomingBedspaces: 0,
      totalArchivedBedspaces: 0,
    })

    const navArr = (activeTab: PremisesShowTabs) => [
      {
        text: 'Property overview',
        href: `/properties/${property.id}?${placeContextQueryString}`,
        active: activeTab === 'premises',
      },
      {
        text: 'Bedspaces overview',
        href: `/properties/${property.id}/bedspaces?${placeContextQueryString}`,
        active: activeTab === 'bedspaces',
      },
    ]

    it('shows an online premises', async () => {
      request = createMock<Request>({
        session: { probationRegion: probationRegionFactory.build() },
        url: `/properties/${property.id}`,
        params: {
          premisesId: property.id,
        },
        query: {
          placeContextAssessmentId: placeContext.assessment.id,
          placeContextArrivalDate: placeContext.arrivalDate,
        },
      })

      premisesService.getSinglePremises.mockResolvedValue(property)
      assessmentService.findAssessment.mockResolvedValue(assessment)

      const requestHandler = premisesController.showPremisesTab()
      await requestHandler(request, response, next)

      const subNavArr = navArr('premises')
      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/premises/show', {
        premises: property,
        summary: premisesUtils.summaryList(property),
        actions: [
          {
            text: 'Add a bedspace',
            classes: 'govuk-button--secondary',
            href: `/properties/${property.id}/bedspaces/new?${placeContextQueryString}`,
          },
          {
            text: 'Archive property',
            classes: 'govuk-button--secondary',
            href: `/properties/${property.id}/archive`,
          },
          {
            text: 'Edit property details',
            classes: 'govuk-button--secondary',
            href: `/properties/${property.id}/edit?${placeContextQueryString}`,
          },
        ],
        showPremises: true,
        subNavArr,
      })

      expect(premisesService.getSinglePremises).toHaveBeenCalledWith(callConfig, property.id)
      expect(premisesUtils.summaryList).toHaveBeenCalledWith(property)
    })

    it('shows the bedspace summary tab for an online premises', async () => {
      request = createMock<Request>({
        session: { probationRegion: probationRegionFactory.build() },
        url: `/properties/${property.id}/bedspaces`,
        params: { premisesId: property.id },
        query: {
          placeContextAssessmentId: placeContext.assessment.id,
          placeContextArrivalDate: placeContext.arrivalDate,
        },
      })

      premisesService.getSinglePremises.mockResolvedValue(property)
      bedspaceService.getBedspacesForPremises.mockResolvedValue(bedspaces)

      const requestHandler = premisesController.showBedspacesTab()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/premises/show', {
        premises: property,
        bedspaceSummaries: bedspaces.bedspaces.map(bedspace => ({
          id: bedspace.id,
          reference: bedspace.reference,
          summary: bedspaceUtils.summaryList(bedspace),
        })),
        actions: [
          {
            text: 'Add a bedspace',
            classes: 'govuk-button--secondary',
            href: `/properties/${property.id}/bedspaces/new?${placeContextQueryString}`,
          },
          {
            text: 'Archive property',
            classes: 'govuk-button--secondary',
            href: `/properties/${property.id}/archive`,
          },
          {
            text: 'Edit property details',
            classes: 'govuk-button--secondary',
            href: `/properties/${property.id}/edit?${placeContextQueryString}`,
          },
        ],
        showPremises: false,
        subNavArr: navArr('bedspaces'),
      })

      expect(premisesService.getSinglePremises).toHaveBeenCalledWith(callConfig, property.id)
    })
  })

  describe('new', () => {
    it('should render the form', async () => {
      premisesService.getReferenceData.mockResolvedValue(referenceData)
      ;(filterProbationRegions as jest.MockedFunction<typeof filterProbationRegions>).mockReturnValue(filteredRegions)

      const requestHandler = premisesController.new()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({ errors: {}, errorSummary: [], userInput: {} })

      await requestHandler(request, response, next)

      expect(premisesService.getReferenceData).toHaveBeenCalledWith(callConfig)
      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/premises/new', {
        localAuthorities: referenceData.localAuthorities,
        characteristics: displayedCharacteristics,
        pdus: referenceData.pdus,
        probationRegions: filteredRegions,
        errors: {},
        errorSummary: [],
      })
    })

    it('should render the form with errors and user input when the backend returns an error', async () => {
      premisesService.getReferenceData.mockResolvedValue(referenceData)
      ;(filterProbationRegions as jest.MockedFunction<typeof filterProbationRegions>).mockReturnValue(filteredRegions)

      const requestHandler = premisesController.new()
      const errorsAndUserInput = createMock<ErrorsAndUserInput>()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue(errorsAndUserInput)

      await requestHandler(request, response, next)

      expect(premisesService.getReferenceData).toHaveBeenCalledWith(callConfig)
      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/premises/new', {
        localAuthorities: referenceData.localAuthorities,
        characteristics: displayedCharacteristics,
        pdus: referenceData.pdus,
        probationRegions: filteredRegions,
        errors: errorsAndUserInput.errors,
        errorSummary: errorsAndUserInput.errorSummary,
        ...errorsAndUserInput.userInput,
      })
    })
  })

  describe('create', () => {
    it('creates a premises and redirects to the show premises page', async () => {
      const requestHandler = premisesController.create()

      const premises = cas3PremisesFactory.build({ status: 'online' })
      const newPremises = cas3NewPremisesFactory.build({ reference: premises.reference })

      request.body = {
        ...newPremises,
      }

      premisesService.createPremises.mockResolvedValue(premises)

      await requestHandler(request, response, next)

      expect(premisesService.createPremises).toHaveBeenCalledWith(callConfig, {
        ...newPremises,
      })

      expect(request.flash).toHaveBeenCalledWith('success', 'Property added')
      expect(response.redirect).toHaveBeenCalledWith(`/properties/${premises.id}`)
    })

    it('should fail to create a premises when the service returns an error', async () => {
      const requestHandler = premisesController.create()

      const newPremises = cas3NewPremisesFactory.build({ addressLine1: '' })

      request.body = {
        ...newPremises,
      }

      const err = {
        data: {
          title: 'Bad Request',
          status: 400,
          detail: 'There is a problem with your request',
          'invalid-params': [{ propertyName: '$.addressLine1', errorType: 'empty' }],
        },
      }

      premisesService.createPremises.mockImplementation(() => {
        throw err
      })

      await requestHandler(request, response, next)

      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(request, response, err, '/properties/new')
    })
  })

  describe('edit', () => {
    const premises = cas3PremisesFactory.build()
    const summaryList: SummaryList = {
      rows: [
        {
          key: { text: 'Property status' },
          value: { html: `<strong class="govuk-tag govuk-tag--grey">Archived</strong>` },
        },
        {
          key: { text: 'Address' },
          value: {
            html: `${premises.addressLine1}<br />${premises.addressLine2}<br />${premises.town}<br />${premises.postcode}`,
          },
        },
      ],
    }

    beforeEach(() => {
      jest.spyOn(premisesUtils, 'shortSummaryList').mockReturnValue(summaryList)
      premisesService.getReferenceData.mockResolvedValue(referenceData)
      ;(filterProbationRegions as jest.MockedFunction<typeof filterProbationRegions>).mockReturnValue(filteredRegions)
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({ errors: {}, errorSummary: [], userInput: {} })
    })

    it('should render the form', async () => {
      premisesService.getSinglePremises.mockResolvedValue(premises)

      const requestHandler = premisesController.edit()

      request.params.premisesId = premises.id

      await requestHandler(request, response, next)

      expect(premisesService.getReferenceData).toHaveBeenCalledWith(callConfig)
      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/premises/edit', {
        premisesId: premises.id,
        errors: {},
        errorSummary: [],
        localAuthorities: referenceData.localAuthorities,
        characteristics: displayedCharacteristics,
        probationRegions: filteredRegions,
        pdus: referenceData.pdus,
        summary: summaryList,
        reference: premises.reference,
        addressLine1: premises.addressLine1,
        addressLine2: premises.addressLine2,
        town: premises.town,
        postcode: premises.postcode,
        localAuthorityAreaId: premises.localAuthorityArea.id,
        probationRegionId: premises.probationRegion.id,
        probationDeliveryUnitId: premises.probationDeliveryUnit.id,
        characteristicIds: premises.premisesCharacteristics.map(ch => ch.id),
        notes: premises.notes,
        turnaroundWorkingDays: premises.turnaroundWorkingDays,
      })
    })

    it('should render the form when optional parameters are missing', async () => {
      const premisesWithMissingOptionalFields: Cas3Premises = {
        ...premises,
        localAuthorityArea: undefined,
        premisesCharacteristics: undefined,
      }
      premisesService.getSinglePremises.mockResolvedValue(premisesWithMissingOptionalFields)

      const requestHandler = premisesController.edit()

      request.params.premisesId = premises.id

      await requestHandler(request, response, next)

      expect(premisesService.getReferenceData).toHaveBeenCalledWith(callConfig)
      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/premises/edit', {
        premisesId: premises.id,
        errors: {},
        errorSummary: [],
        localAuthorities: referenceData.localAuthorities,
        characteristics: displayedCharacteristics,
        probationRegions: filteredRegions,
        pdus: referenceData.pdus,
        summary: summaryList,
        reference: premises.reference,
        addressLine1: premises.addressLine1,
        addressLine2: premises.addressLine2,
        town: premises.town,
        postcode: premises.postcode,
        localAuthorityAreaId: undefined,
        probationRegionId: premises.probationRegion.id,
        probationDeliveryUnitId: premises.probationDeliveryUnit.id,
        characteristicIds: undefined,
        notes: premises.notes,
        turnaroundWorkingDays: premises.turnaroundWorkingDays,
      })
    })

    it('should render the form with errors and user input when the backend returns an error', async () => {
      premisesService.getSinglePremises.mockResolvedValue(premises)

      const requestHandler = premisesController.edit()
      const errorsAndUserInput = createMock<ErrorsAndUserInput>()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue(errorsAndUserInput)

      await requestHandler(request, response, next)

      expect(premisesService.getReferenceData).toHaveBeenCalledWith(callConfig)
      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/premises/edit', {
        localAuthorities: referenceData.localAuthorities,
        characteristics: displayedCharacteristics,
        pdus: referenceData.pdus,
        probationRegions: filteredRegions,
        errors: errorsAndUserInput.errors,
        errorSummary: errorsAndUserInput.errorSummary,
        ...errorsAndUserInput.userInput,
        summary: summaryList,
        reference: premises.reference,
        addressLine1: premises.addressLine1,
        addressLine2: premises.addressLine2,
        town: premises.town,
        postcode: premises.postcode,
        localAuthorityAreaId: premises.localAuthorityArea.id,
        probationRegionId: premises.probationRegion.id,
        probationDeliveryUnitId: premises.probationDeliveryUnit.id,
        characteristicIds: premises.premisesCharacteristics.map(ch => ch.id),
        notes: premises.notes,
        turnaroundWorkingDays: premises.turnaroundWorkingDays,
      })
    })
  })

  describe('update', () => {
    it('should successfully update a premises and redirect to the show premises page', async () => {
      const requestHandler = premisesController.update()

      const premises = cas3PremisesFactory.build()
      const updatedPremises = cas3UpdatePremisesFactory.build()

      request.params.premisesId = premises.id

      request.body = updatedPremises

      premisesService.updatePremises.mockResolvedValue(premises)

      await requestHandler(request, response, next)

      expect(premisesService.updatePremises).toHaveBeenCalledWith(callConfig, premises.id, { ...updatedPremises })
      expect(request.flash).toHaveBeenCalledWith('success', 'Property edited')
      expect(response.redirect).toHaveBeenCalledWith(`/properties/${premises.id}`)
    })

    it('should fail to update a premises when the service returns an error', async () => {
      const requestHandler = premisesController.update()

      const premisesId = '789f2246-0b90-43ba-b394-6b2433591c92'
      const updatedPremises = cas3UpdatePremisesFactory.build()

      request.params.premisesId = premisesId

      request.body = {
        ...updatedPremises,
        addressLine1: '',
      }

      const err = {
        data: {
          title: 'Bad Request',
          status: 400,
          detail: 'There is a problem with your request',
          'invalid-params': [{ propertyName: '$.addressLine1', errorType: 'empty' }],
        },
      }

      premisesService.updatePremises.mockImplementation(() => {
        throw err
      })

      await requestHandler(request, response, next)

      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        err,
        `/properties/${premisesId}/edit`,
      )
    })
  })

  describe('archive', () => {
    const premises = cas3PremisesFactory.build()

    it('should render the form', async () => {
      premisesService.getSinglePremises.mockResolvedValue(premises)

      const requestHandler = premisesController.archive()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({ errors: {}, errorSummary: [], userInput: {} })

      request.params.premisesId = premises.id

      await requestHandler(request, response, next)

      expect(premisesService.getSinglePremises).toHaveBeenCalledWith(callConfig, premises.id)
      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/premises/archive', {
        premises,
        errors: {},
        errorSummary: [],
      })
    })

    it('should render the form with errors and user input when the backend returns an error', async () => {
      premisesService.getSinglePremises.mockResolvedValue(premises)

      const requestHandler = premisesController.archive()
      const errorsAndUserInput = createMock<ErrorsAndUserInput>()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue(errorsAndUserInput)

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/premises/archive', {
        premises,
        errors: errorsAndUserInput.errors,
        errorSummary: errorsAndUserInput.errorSummary,
        ...errorsAndUserInput.userInput,
      })
    })

    it('should tell the user they cannot archive a premises when some of its bedspaces have bookings further in the future than it can be archived', async () => {
      premisesService.getSinglePremises.mockResolvedValue(premises)
      const bedspace1 = cas3BedspaceReferenceFactory.build({ entityReference: 'Apple' })
      const bedspace2 = cas3BedspaceReferenceFactory.build({ entityReference: 'Banana' })
      const bedspace3 = cas3BedspaceReferenceFactory.build({ entityReference: 'Cherry' })
      const bedspaces = cas3BedspacesReferenceFactory.build({
        items: [bedspace2, bedspace3, bedspace1],
      })
      premisesService.canArchivePremises.mockResolvedValue(bedspaces)

      const requestHandler = premisesController.archive()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({ errors: {}, errorSummary: {}, userInput: {} })

      request.params.premisesId = premises.id

      await requestHandler(request, response, next)

      expect(premisesService.getSinglePremises).toHaveBeenCalledWith(callConfig, premises.id)
      expect(premisesService.canArchivePremises).toHaveBeenCalledWith(callConfig, premises.id)
      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/premises/cannot-archive', {
        premises,
        bedspaces: [bedspace1, bedspace2, bedspace3],
      })
    })
  })

  describe('archiveSubmit', () => {
    const premises = cas3PremisesFactory.build()

    it('should successfully archive a premises and redirect to the show premises page', async () => {
      const today = new Date()

      request.params.premisesId = premises.id
      request.body = { archiveOption: 'today' }

      premisesService.archivePremises.mockResolvedValue(premises)

      const requestHandler = premisesController.archiveSubmit()

      await requestHandler(request, response, next)

      expect(premisesService.archivePremises).toHaveBeenCalledWith(callConfig, premises.id, {
        endDate: DateFormats.dateObjToIsoDate(today),
      })
      expect(request.flash).toHaveBeenCalledWith('success', 'Property and bedspaces archived')
      expect(response.redirect).toHaveBeenCalledWith(`/properties/${premises.id}`)
    })

    it('should fail to archive when the service returns an error', async () => {
      request.params.premisesId = premises.id
      request.body = { archiveOption: 'today' }

      const earliestDate = new Date()
      earliestDate.setDate(earliestDate.getDate() + 7)

      const error = {
        data: {
          title: 'Bad Request',
          status: 400,
          detail: 'There is a problem with your request',
          'invalid-params': [
            {
              propertyName: '$.endDate',
              errorType: 'existingUpcomingBedspace',
              entityId: 'a094a15b-5ead-4c99-a20b-77aa15eb9ce6',
              value: DateFormats.dateObjToIsoDate(earliestDate),
            },
          ],
        },
      }

      const mergeParameters: Array<Record<string, Record<string, string>>> = []

      premisesService.archivePremises.mockImplementation(() => {
        throw error
      })
      ;(generateMergeParameters as jest.Mock).mockReturnValue(mergeParameters)

      const requestHandler = premisesController.archiveSubmit()

      await requestHandler(request, response, next)

      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        error,
        `/properties/${premises.id}/archive`,
        'premisesArchive',
        mergeParameters,
      )

      expect(generateMergeParameters).toHaveBeenCalled()
    })

    it('should show an error when the user has not selected a date option', async () => {
      request.params.premisesId = premises.id
      request.body = {}

      const errorMessage = 'Select a date to archive the property'

      ;(generateErrorMessages as jest.Mock).mockReturnValue([{ today: { text: errorMessage } }])
      ;(generateErrorSummary as jest.Mock).mockReturnValue([{ text: errorMessage, href: '#today' }])

      const requestHandler = premisesController.archiveSubmit()

      await requestHandler(request, response, next)

      const expectedErrors = [{ today: { text: 'Select a date to archive the property' } }]
      const expectedErrorSummary = [{ text: 'Select a date to archive the property', href: '#today' }]

      expect(request.flash).toHaveBeenCalledWith('errors', expectedErrors)
      expect(request.flash).toHaveBeenCalledWith('errorSummary', expectedErrorSummary)
      expect(response.redirect).toHaveBeenCalledWith(`/properties/${premises.id}/archive`)
    })
  })

  describe('unarchive', () => {
    const premises = cas3PremisesFactory.build()

    it('should render the form', async () => {
      premisesService.getSinglePremises.mockResolvedValue(premises)

      const requestHandler = premisesController.unarchive()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({ errors: {}, errorSummary: [], userInput: {} })

      request.params.premisesId = premises.id

      await requestHandler(request, response, next)

      expect(premisesService.getSinglePremises).toHaveBeenCalledWith(callConfig, premises.id)
      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/premises/unarchive', {
        premises,
        errors: {},
        errorSummary: [],
      })
    })

    it('should render the form with errors and user input when the backend returns an error', async () => {
      premisesService.getSinglePremises.mockResolvedValue(premises)

      const requestHandler = premisesController.unarchive()
      const errorsAndUserInput = createMock<ErrorsAndUserInput>()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue(errorsAndUserInput)

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/premises/unarchive', {
        premises,
        errors: errorsAndUserInput.errors,
        errorSummary: errorsAndUserInput.errorSummary,
        ...errorsAndUserInput.userInput,
      })
    })
  })

  describe('unarchiveSubmit', () => {
    const premises = cas3PremisesFactory.build()

    it('should successfully unarchive a premises and redirect to the show premises page', async () => {
      const today = new Date()

      request.params.premisesId = premises.id
      request.body = { unarchiveOption: 'today' }

      premisesService.unarchivePremises.mockResolvedValue(premises)

      const requestHandler = premisesController.unarchiveSubmit()

      await requestHandler(request, response, next)

      expect(premisesService.unarchivePremises).toHaveBeenCalledWith(callConfig, premises.id, {
        restartDate: DateFormats.dateObjToIsoDate(today),
      })
      expect(request.flash).toHaveBeenCalledWith('success', 'Property and bedspaces online')
      expect(response.redirect).toHaveBeenCalledWith(`/properties/${premises.id}`)
    })

    it('should fail to unarchive when the service returns an error', async () => {
      request.params.premisesId = premises.id
      request.body = { unarchiveOption: 'today' }

      const error = {
        data: {
          title: 'Bad request',
          status: 400,
          detail: 'There is a problem with your request',
          'invalid-params': [
            {
              propertyName: '$.restartDate',
              errorType: 'beforeLastPremisesArchivedDate',
            },
          ],
        },
      }

      premisesService.unarchivePremises.mockImplementation(() => {
        throw error
      })

      const requestHandler = premisesController.unarchiveSubmit()

      await requestHandler(request, response, next)

      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        error,
        `/properties/${premises.id}/unarchive`,
        'premisesUnarchive',
      )
    })

    it('should show an error when the user has not selected a date option', async () => {
      request.params.premisesId = premises.id
      request.body = {}

      const errorMessage = 'Select a date for the property go online'

      ;(generateErrorMessages as jest.Mock).mockReturnValue([{ today: { text: errorMessage } }])
      ;(generateErrorSummary as jest.Mock).mockReturnValue([{ text: errorMessage, href: '#today' }])

      const requestHandler = premisesController.unarchiveSubmit()

      await requestHandler(request, response, next)

      const expectedErrors = [{ today: { text: 'Select a date for the property go online' } }]
      const expectedErrorSummary = [{ text: 'Select a date for the property go online', href: '#today' }]

      expect(request.flash).toHaveBeenCalledWith('errors', expectedErrors)
      expect(request.flash).toHaveBeenCalledWith('errorSummary', expectedErrorSummary)
      expect(response.redirect).toHaveBeenCalledWith(`/properties/${premises.id}/unarchive`)
    })
  })

  describe('cancelArchive', () => {
    const premises = cas3PremisesFactory.build({ endDate: '2025-12-31' })

    it('should render the cancel archive form', async () => {
      premisesService.getSinglePremises.mockResolvedValue(premises)

      const requestHandler = premisesController.cancelArchive()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({ errors: {}, errorSummary: [], userInput: {} })

      request.params.premisesId = premises.id

      await requestHandler(request, response, next)

      expect(premisesService.getSinglePremises).toHaveBeenCalledWith(callConfig, premises.id)
      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/premises/cancel-archive', {
        premises,
        errors: {},
        errorSummary: [],
        premisesEndDate: '31 December 2025',
      })
    })
  })

  describe('cancelArchiveSubmit', () => {
    const premises = cas3PremisesFactory.build()

    it('should successfully cancel archive and redirect to the show premises page', async () => {
      request.params.premisesId = premises.id
      request.body = { cancelArchive: 'yes' }

      premisesService.cancelArchivePremises.mockResolvedValue(premises)

      const requestHandler = premisesController.cancelArchiveSubmit()

      await requestHandler(request, response, next)

      expect(premisesService.cancelArchivePremises).toHaveBeenCalledWith(callConfig, premises.id)
      expect(request.flash).toHaveBeenCalledWith('success', 'Scheduled archive cancelled')
      expect(response.redirect).toHaveBeenCalledWith(`/properties/${premises.id}`)
    })

    it('should redirect to show premises page when user selects no', async () => {
      request.params.premisesId = premises.id
      request.body = { cancelArchive: 'no' }

      premisesService.cancelArchivePremises.mockReset()

      const requestHandler = premisesController.cancelArchiveSubmit()

      await requestHandler(request, response, next)

      expect(premisesService.cancelArchivePremises).not.toHaveBeenCalled()
      expect(response.redirect).toHaveBeenCalledWith(`/properties/${premises.id}`)
    })

    it('should show validation error when no option is selected', async () => {
      request.params.premisesId = premises.id
      request.body = {}

      const errorMessage = 'You need to choose an option to proceed'

      ;(generateErrorMessages as jest.Mock).mockReturnValue([{ cancelArchive: { text: errorMessage } }])
      ;(generateErrorSummary as jest.Mock).mockReturnValue([{ text: errorMessage, href: '#cancelArchive' }])

      const requestHandler = premisesController.cancelArchiveSubmit()

      await requestHandler(request, response, next)

      expect(request.flash).toHaveBeenCalledWith('errors', [{ cancelArchive: { text: errorMessage } }])
      expect(request.flash).toHaveBeenCalledWith('errorSummary', [{ text: errorMessage, href: '#cancelArchive' }])
      expect(request.flash).toHaveBeenCalledWith('userInput', {})
      expect(response.redirect).toHaveBeenCalledWith(`/properties/${premises.id}/cancel-archive`)
    })

    it('should handle API errors when cancelling archive', async () => {
      request.params.premisesId = premises.id
      request.body = { cancelArchive: 'yes' }

      const error = {
        data: {
          title: 'Bad Request',
          status: 400,
          detail: 'There is a problem with your request',
          'invalid-params': [
            {
              propertyName: '$.premisesId',
              errorType: 'premisesNotScheduledToArchive',
            },
          ],
        },
      }

      premisesService.cancelArchivePremises.mockImplementation(() => {
        throw error
      })

      const requestHandler = premisesController.cancelArchiveSubmit()

      await requestHandler(request, response, next)

      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        error,
        `/properties/${premises.id}/cancel-archive`,
        'premisesCancelArchive',
      )
    })
  })

  describe('cancelUnarchive', () => {
    const premises = cas3PremisesFactory.build({ scheduleUnarchiveDate: '2025-12-31' })

    it('should render the cancel unarchive form', async () => {
      premisesService.getSinglePremises.mockResolvedValue(premises)

      const requestHandler = premisesController.cancelUnarchive()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({ errors: {}, errorSummary: [], userInput: {} })

      request.params.premisesId = premises.id

      await requestHandler(request, response, next)

      expect(premisesService.getSinglePremises).toHaveBeenCalledWith(callConfig, premises.id)
      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/premises/cancel-unarchive', {
        premises,
        errors: {},
        errorSummary: [],
        premisesScheduleUnarchiveDate: '31 December 2025',
      })
    })
  })

  describe('cancelUnarchiveSubmit', () => {
    const premises = cas3PremisesFactory.build()

    it('should successfully cancel unarchive and redirect to the show premises page', async () => {
      request.params.premisesId = premises.id
      request.body = { cancelUnarchive: 'yes' }

      premisesService.cancelUnarchivePremises.mockResolvedValue(premises)

      const requestHandler = premisesController.cancelUnarchiveSubmit()

      await requestHandler(request, response, next)

      expect(premisesService.cancelUnarchivePremises).toHaveBeenCalledWith(callConfig, premises.id)
      expect(request.flash).toHaveBeenCalledWith('success', 'Scheduled unarchive cancelled')
      expect(response.redirect).toHaveBeenCalledWith(`/properties/${premises.id}`)
    })

    it('should redirect to show premises page when user selects no', async () => {
      request.params.premisesId = premises.id
      request.body = { cancelUnarchive: 'no' }

      premisesService.cancelUnarchivePremises.mockReset()

      const requestHandler = premisesController.cancelUnarchiveSubmit()

      await requestHandler(request, response, next)

      expect(premisesService.cancelUnarchivePremises).not.toHaveBeenCalled()
      expect(response.redirect).toHaveBeenCalledWith(`/properties/${premises.id}`)
    })

    it('should show validation error when no option is selected', async () => {
      request.params.premisesId = premises.id
      request.body = {}

      const errorMessage = 'You need to choose an option to proceed'

      ;(generateErrorMessages as jest.Mock).mockReturnValue([{ cancelUnarchive: { text: errorMessage } }])
      ;(generateErrorSummary as jest.Mock).mockReturnValue([{ text: errorMessage, href: '#cancelUnarchive' }])

      const requestHandler = premisesController.cancelUnarchiveSubmit()

      await requestHandler(request, response, next)

      expect(request.flash).toHaveBeenCalledWith('errors', [{ cancelUnarchive: { text: errorMessage } }])
      expect(request.flash).toHaveBeenCalledWith('errorSummary', [{ text: errorMessage, href: '#cancelUnarchive' }])
      expect(request.flash).toHaveBeenCalledWith('userInput', {})
      expect(response.redirect).toHaveBeenCalledWith(`/properties/${premises.id}/cancel-unarchive`)
    })

    it('should handle API errors when cancelling unarchive', async () => {
      request.params.premisesId = premises.id
      request.body = { cancelUnarchive: 'yes' }

      const error = {
        data: {
          title: 'Bad Request',
          status: 400,
          detail: 'Cannot cancel unarchive',
          'invalid-params': [
            {
              propertyName: '$.scheduleUnarchiveDate',
              errorType: 'invalid',
            },
          ],
        },
      }

      premisesService.cancelUnarchivePremises.mockImplementation(() => {
        throw error
      })

      const requestHandler = premisesController.cancelUnarchiveSubmit()

      await requestHandler(request, response, next)

      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        error,
        `/properties/${premises.id}/cancel-unarchive`,
        'premisesCancelUnarchive',
      )
    })
  })
})
