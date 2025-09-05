import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import { ErrorsAndUserInput, PremisesShowTabs, SummaryList } from '@approved-premises/ui'
import type { Cas3Premises, Cas3PremisesSearchResult } from '@approved-premises/api'
import { CallConfig } from '../../../../data/restClient'
import PremisesService from '../../../../services/v2/premisesService'
import {
  assessmentFactory,
  cas3BedspaceFactory,
  cas3BedspacesFactory,
  cas3BedspacesReferenceFactory,
  cas3NewPremisesFactory,
  cas3PremisesFactory,
  cas3UpdatePremisesFactory,
  placeContextFactory,
  probationRegionFactory,
  referenceDataFactory,
} from '../../../../testutils/factories'
import extractCallConfig from '../../../../utils/restUtils'
import PremisesController from './premisesController'
import paths from '../../../../paths/temporary-accommodation/manage'
import { filterProbationRegions } from '../../../../utils/userUtils'
import {
  catchValidationErrorOrPropogate,
  fetchErrorsAndUserInput,
  generateMergeParameters,
} from '../../../../utils/validation'
import BedspaceService from '../../../../services/v2/bedspaceService'
import { DateFormats } from '../../../../utils/dateUtils'
import { AssessmentsService } from '../../../../services'
import cas3BedspaceReferenceFactory from '../../../../testutils/factories/cas3BedspaceReference'

jest.mock('../../../../utils/validation')
jest.mock('../../../../utils/restUtils')
jest.mock('../../../../utils/userUtils')

describe('PremisesController', () => {
  const callConfig = { token: 'some-call-config-token' } as CallConfig

  const referenceData = {
    localAuthorities: referenceDataFactory.localAuthority().buildList(5),
    characteristics: referenceDataFactory.characteristic('premises').buildList(5),
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

  let request: Request

  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const premisesService = createMock<PremisesService>({})
  const bedspaceService = createMock<BedspaceService>({})
  const assessmentService = createMock<AssessmentsService>({})

  const premisesController = new PremisesController(premisesService, bedspaceService, assessmentService)

  beforeEach(() => {
    request = createMock<Request>({
      session: {
        probationRegion: probationRegionFactory.build(),
      },
      query: {},
    })
    ;(extractCallConfig as jest.MockedFn<typeof extractCallConfig>).mockReturnValue(callConfig)
    assessmentService.findAssessment.mockResolvedValue(assessment)
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
      { html: '<a>Bedspace 1</a><br /><a>Bedspace 2</a>(Archived)' },
      { text: 'Hammersmith, Fulham, Kensington, Chelsea and Westminster' },
      { html: 'Manage' },
    ]
    const premisesRow3 = [
      { html: '62 West Wallaby Street<br />Wigan<br />WG7 7FU' },
      { html: '<a>Bedspace A</a><br /><a>Bedspace B</a>' },
      { text: 'Wigan' },
      { html: 'Manage' },
    ]

    it('searches online premises data and returns as table rows when no status parameter is provided', async () => {
      const postcodeOrAddress: string | undefined = undefined
      const params = {
        postcodeOrAddress,
        placeContextAssessmentId: placeContext.assessment.id,
        placeContextArrivalDate: placeContext.arrivalDate,
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
        path: '/properties/online',
      })

      premisesService.searchDataAndGenerateTableRows.mockResolvedValue(searchData)

      const requestHandler = premisesController.index('online')
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/v2/premises/index', {
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
      })

      expect(premisesService.searchDataAndGenerateTableRows).toHaveBeenCalledWith(
        callConfig,
        params.postcodeOrAddress,
        placeContext,
        'online',
        'pdu',
      )
    })

    it('searches online premises data and returns as table rows when status=online parameter is provided', async () => {
      const postcodeOrAddress: string | undefined = undefined
      const params = {
        postcodeOrAddress,
        placeContextAssessmentId: placeContext.assessment.id,
        placeContextArrivalDate: placeContext.arrivalDate,
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
        path: '/properties/online',
      })

      premisesService.searchDataAndGenerateTableRows.mockResolvedValue(searchData)

      const requestHandler = premisesController.index('online')
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/v2/premises/index', {
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
      })

      expect(premisesService.searchDataAndGenerateTableRows).toHaveBeenCalledWith(
        callConfig,
        params.postcodeOrAddress,
        placeContext,
        'online',
        'pdu',
      )
    })

    it('searches online premises data by postcode or address and returns as table rows when searched for a postcode or address', async () => {
      const params = {
        postcodeOrAddress: 'NE1',
        placeContextAssessmentId: placeContext.assessment.id,
        placeContextArrivalDate: placeContext.arrivalDate,
      }
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
        path: '/properties/online',
      })

      const requestHandler = premisesController.index('online')
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/v2/premises/index', {
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
      })

      expect(premisesService.searchDataAndGenerateTableRows).toHaveBeenCalledWith(
        callConfig,
        params.postcodeOrAddress,
        placeContext,
        'online',
        'pdu',
      )
    })

    it('returns empty search data when there are no properties in the database', async () => {
      const postcodeOrAddress: string | undefined = undefined
      const params = {
        postcodeOrAddress,
        placeContextAssessmentId: placeContext.assessment.id,
        placeContextArrivalDate: placeContext.arrivalDate,
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
        path: '/properties/online',
      })

      premisesService.searchDataAndGenerateTableRows.mockResolvedValue(searchData)

      const requestHandler = premisesController.index('online')
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/v2/premises/index', {
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
      })

      expect(premisesService.searchDataAndGenerateTableRows).toHaveBeenCalledWith(
        callConfig,
        params.postcodeOrAddress,
        placeContext,
        'online',
        'pdu',
      )
    })

    it('returns zero online properties data when no properties exist in database', async () => {
      const postcodeOrAddress: string | undefined = undefined
      const params = {
        postcodeOrAddress,
        placeContextAssessmentId: placeContext.assessment.id,
        placeContextArrivalDate: placeContext.arrivalDate,
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
        path: '/properties/online',
      })

      premisesService.searchDataAndGenerateTableRows.mockResolvedValue(searchData)

      const requestHandler = premisesController.index('online')
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/v2/premises/index', {
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

      expect(premisesService.searchDataAndGenerateTableRows).toHaveBeenCalledWith(
        callConfig,
        params.postcodeOrAddress,
        placeContext,
        'online',
        'pdu',
      )
    })

    it('returns online properties data with search term and bedspace counts when search has results', async () => {
      const params = {
        postcodeOrAddress: 'NE1',
        placeContextAssessmentId: placeContext.assessment.id,
        placeContextArrivalDate: placeContext.arrivalDate,
      }
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
        path: '/properties/online',
      })

      premisesService.searchDataAndGenerateTableRows.mockResolvedValue(searchData)

      const requestHandler = premisesController.index('online')
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/v2/premises/index', {
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
        totalPremises: 2,
        totalOnlineBedspaces: 8,
        totalUpcomingBedspaces: 3,
        results: [],
        tableRows: [premisesRow1, premisesRow2],
      })

      expect(premisesService.searchDataAndGenerateTableRows).toHaveBeenCalledWith(
        callConfig,
        params.postcodeOrAddress,
        placeContext,
        'online',
        'pdu',
      )
    })

    it('returns zero online properties data with search term when search returns no results', async () => {
      const params = {
        postcodeOrAddress: 'NONEXISTENT',
        placeContextAssessmentId: placeContext.assessment.id,
        placeContextArrivalDate: placeContext.arrivalDate,
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
        path: '/properties/online',
      })

      premisesService.searchDataAndGenerateTableRows.mockResolvedValue(searchData)

      const requestHandler = premisesController.index('online')
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/v2/premises/index', {
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

      expect(premisesService.searchDataAndGenerateTableRows).toHaveBeenCalledWith(
        callConfig,
        params.postcodeOrAddress,
        placeContext,
        'online',
        'pdu',
      )
    })

    it('returns zero archived properties data when no archived properties exist in database', async () => {
      const postcodeOrAddress: string | undefined = undefined
      const params = {
        postcodeOrAddress,
        placeContextAssessmentId: placeContext.assessment.id,
        placeContextArrivalDate: placeContext.arrivalDate,
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
        path: '/properties/archived',
      })

      premisesService.searchDataAndGenerateTableRows.mockResolvedValue(searchData)

      const requestHandler = premisesController.index('archived')
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/v2/premises/index', {
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

      expect(premisesService.searchDataAndGenerateTableRows).toHaveBeenCalledWith(
        callConfig,
        params.postcodeOrAddress,
        placeContext,
        'archived',
        'pdu',
      )
    })

    it('returns archived properties data with search term when search has results', async () => {
      const params = {
        postcodeOrAddress: 'SW1',
        placeContextAssessmentId: placeContext.assessment.id,
        placeContextArrivalDate: placeContext.arrivalDate,
      }
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
        path: '/properties/archived',
      })

      premisesService.searchDataAndGenerateTableRows.mockResolvedValue(searchData)

      const requestHandler = premisesController.index('archived')
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/v2/premises/index', {
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
        totalPremises: 3,
        totalOnlineBedspaces: 0,
        totalUpcomingBedspaces: 0,
        results: [],
        tableRows: [premisesRow1, premisesRow2, premisesRow3],
      })

      expect(premisesService.searchDataAndGenerateTableRows).toHaveBeenCalledWith(
        callConfig,
        params.postcodeOrAddress,
        placeContext,
        'archived',
        'pdu',
      )
    })

    it('returns zero archived properties data with search term when search returns no results', async () => {
      const params = {
        postcodeOrAddress: 'NOTFOUND',
        placeContextAssessmentId: placeContext.assessment.id,
        placeContextArrivalDate: placeContext.arrivalDate,
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
        path: '/properties/archived',
      })

      premisesService.searchDataAndGenerateTableRows.mockResolvedValue(searchData)

      const requestHandler = premisesController.index('archived')
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/v2/premises/index', {
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

      expect(premisesService.searchDataAndGenerateTableRows).toHaveBeenCalledWith(
        callConfig,
        params.postcodeOrAddress,
        placeContext,
        'archived',
        'pdu',
      )
    })
  })

  it('searches premises data and returns as table rows when premisesSortBy is "la"', async () => {
    const postcodeOrAddress: string | undefined = undefined
    const params = {
      postcodeOrAddress,
      placeContextAssessmentId: placeContext.assessment.id,
      placeContextArrivalDate: placeContext.arrivalDate,
    }
    const searchData = {
      results: [] as Array<Cas3PremisesSearchResult>,
      totalPremises: 1,
      totalOnlineBedspaces: 2,
      totalUpcomingBedspaces: 0,
      tableRows: [] as Array<never>,
    }

    request = createMock<Request>({
      session: {
        probationRegion: probationRegionFactory.build(),
        premisesSortBy: 'la',
      },
      query: params,
      path: '/properties/online',
    })

    premisesService.searchDataAndGenerateTableRows.mockResolvedValue(searchData)

    const requestHandler = premisesController.index('online')
    await requestHandler(request, response, next)

    expect(response.render).toHaveBeenCalledWith('temporary-accommodation/v2/premises/index', {
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
    })

    expect(premisesService.searchDataAndGenerateTableRows).toHaveBeenCalledWith(
      callConfig,
      params.postcodeOrAddress,
      placeContext,
      'online',
      'la',
    )
  })

  describe('toggleSort', () => {
    it('toggles from pdu to la and redirects with query params', async () => {
      const req = createMock<Request>({
        session: { premisesSortBy: 'pdu' },
        query: { postcodeOrAddress: 'SW1A' },
      })
      const res = createMock<Response>({})
      res.redirect = jest.fn()

      const requestHandler = premisesController.toggleSort()
      await requestHandler(req, res, next)

      expect(req.session.premisesSortBy).toBe('la')
      expect(res.redirect).toHaveBeenCalledWith('/properties/online?postcodeOrAddress=SW1A')
    })

    it('toggles from la to pdu and redirects without query params', async () => {
      const req = createMock<Request>({
        session: { premisesSortBy: 'la' },
        query: {},
      })
      const res = createMock<Response>({})
      res.redirect = jest.fn()

      const requestHandler = premisesController.toggleSort()
      await requestHandler(req, res, next)

      expect(req.session.premisesSortBy).toBe('pdu')
      expect(res.redirect).toHaveBeenCalledWith('/properties/online')
    })

    it('defaults to pdu if session value is missing, then toggles to la', async () => {
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

    const bedspaceSummaryLists: Array<{ id: string; reference: string; summary: SummaryList }> =
      bedspaces.bedspaces.map(bedspace => ({
        id: bedspace.id,
        reference: bedspace.reference,
        summary: {
          rows: [
            {
              key: { text: 'Bedspace status' },
              value: { html: '<strong class="govuk-tag govuk-tag--green">Online</strong>' },
            },
            {
              key: { text: 'Start date' },
              value: { text: '1 February 2025' },
            },
            {
              key: { text: 'Bedspace details' },
              value: {
                html: bedspace.characteristics
                  .map(characteristic => `<span class="hmpps-tag-filters">${characteristic.name}</span>`)
                  .join(' '),
              },
            },
            {
              key: { text: 'Additional bedspace details' },
              value: { text: bedspace.notes },
            },
          ],
        },
      }))

    const navArr = (activeTab: PremisesShowTabs) => [
      {
        text: 'Property overview',
        href: `${paths.premises.show({ premisesId: property.id })}?placeContextAssessmentId=${placeContext.assessment.id}&placeContextArrivalDate=${placeContext.arrivalDate}`,
        active: activeTab === 'premises',
      },
      {
        text: 'Bedspaces overview',
        href: `${paths.premises.bedspaces.list({ premisesId: property.id })}?placeContextAssessmentId=${placeContext.assessment.id}&placeContextArrivalDate=${placeContext.arrivalDate}`,
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
      premisesService.summaryList.mockReturnValue(summaryList)
      assessmentService.findAssessment.mockResolvedValue(assessment)

      const requestHandler = premisesController.showPremisesTab()
      await requestHandler(request, response, next)

      const subNavArr = navArr('premises')
      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/v2/premises/show', {
        premises: property,
        summary: summaryList,
        actions: [
          {
            text: 'Add a bedspace',
            classes: 'govuk-button--secondary',
            href: `/properties/${property.id}/bedspaces/new`,
          },
          {
            text: 'Archive property',
            classes: 'govuk-button--secondary',
            href: `/properties/${property.id}/archive`,
          },
          {
            text: 'Edit property details',
            classes: 'govuk-button--secondary',
            href: `/properties/${property.id}/edit`,
          },
        ],
        showPremises: true,
        subNavArr,
      })

      expect(premisesService.getSinglePremises).toHaveBeenCalledWith(callConfig, property.id)
      expect(premisesService.summaryList).toHaveBeenCalledWith(property)
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
      bedspaceService.summaryList.mockReturnValueOnce(bedspaceSummaryLists[0].summary)
      bedspaceService.summaryList.mockReturnValueOnce(bedspaceSummaryLists[1].summary)
      bedspaceService.summaryList.mockReturnValueOnce(bedspaceSummaryLists[2].summary)

      const requestHandler = premisesController.showBedspacesTab()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/v2/premises/show', {
        premises: property,
        bedspaceSummaries: bedspaceSummaryLists,
        actions: [
          {
            text: 'Add a bedspace',
            classes: 'govuk-button--secondary',
            href: `/properties/${property.id}/bedspaces/new`,
          },
          {
            text: 'Archive property',
            classes: 'govuk-button--secondary',
            href: `/properties/${property.id}/archive`,
          },
          {
            text: 'Edit property details',
            classes: 'govuk-button--secondary',
            href: `/properties/${property.id}/edit`,
          },
        ],
        showPremises: false,
        subNavArr: navArr('bedspaces'),
      })

      expect(premisesService.getSinglePremises).toHaveBeenCalledWith(callConfig, property.id)
      expect(bedspaceService.summaryList).toHaveBeenCalledTimes(3)
      expect(bedspaceService.summaryList).toHaveBeenCalledWith(bedspaces.bedspaces[0])
      expect(bedspaceService.summaryList).toHaveBeenCalledWith(bedspaces.bedspaces[1])
      expect(bedspaceService.summaryList).toHaveBeenCalledWith(bedspaces.bedspaces[2])
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
      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/v2/premises/new', {
        localAuthorities: referenceData.localAuthorities,
        characteristics: referenceData.characteristics,
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
      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/v2/premises/new', {
        localAuthorities: referenceData.localAuthorities,
        characteristics: referenceData.characteristics,
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
      expect(response.redirect).toHaveBeenCalledWith(paths.premises.show({ premisesId: premises.id }))
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

      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(request, response, err, paths.premises.new({}))
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

    it('should render the form', async () => {
      premisesService.getSinglePremises.mockResolvedValue(premises)
      premisesService.shortSummaryList.mockReturnValue(summaryList)
      premisesService.getReferenceData.mockResolvedValue(referenceData)
      ;(filterProbationRegions as jest.MockedFunction<typeof filterProbationRegions>).mockReturnValue(filteredRegions)

      const requestHandler = premisesController.edit()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({ errors: {}, errorSummary: [], userInput: {} })

      request.params.premisesId = premises.id

      await requestHandler(request, response, next)

      expect(premisesService.getReferenceData).toHaveBeenCalledWith(callConfig)
      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/v2/premises/edit', {
        premisesId: premises.id,
        errors: {},
        errorSummary: [],
        localAuthorities: referenceData.localAuthorities,
        characteristics: referenceData.characteristics,
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
        characteristicIds: premises.characteristics.map(ch => ch.id),
        notes: premises.notes,
        turnaroundWorkingDays: premises.turnaroundWorkingDays,
      })
    })

    it('should render the form when optional parameters are missing', async () => {
      const premisesWithMissingOptionalFields: Cas3Premises = {
        ...premises,
        localAuthorityArea: undefined,
        characteristics: undefined,
      }
      premisesService.getSinglePremises.mockResolvedValue(premisesWithMissingOptionalFields)
      premisesService.shortSummaryList.mockReturnValue(summaryList)
      premisesService.getReferenceData.mockResolvedValue(referenceData)
      ;(filterProbationRegions as jest.MockedFunction<typeof filterProbationRegions>).mockReturnValue(filteredRegions)

      const requestHandler = premisesController.edit()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({ errors: {}, errorSummary: [], userInput: {} })

      request.params.premisesId = premises.id

      await requestHandler(request, response, next)

      expect(premisesService.getReferenceData).toHaveBeenCalledWith(callConfig)
      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/v2/premises/edit', {
        premisesId: premises.id,
        errors: {},
        errorSummary: [],
        localAuthorities: referenceData.localAuthorities,
        characteristics: referenceData.characteristics,
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
      premisesService.shortSummaryList.mockReturnValue(summaryList)

      premisesService.getReferenceData.mockResolvedValue(referenceData)
      ;(filterProbationRegions as jest.MockedFunction<typeof filterProbationRegions>).mockReturnValue(filteredRegions)

      const requestHandler = premisesController.edit()
      const errorsAndUserInput = createMock<ErrorsAndUserInput>()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue(errorsAndUserInput)

      await requestHandler(request, response, next)

      expect(premisesService.getReferenceData).toHaveBeenCalledWith(callConfig)
      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/v2/premises/edit', {
        localAuthorities: referenceData.localAuthorities,
        characteristics: referenceData.characteristics,
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
        characteristicIds: premises.characteristics.map(ch => ch.id),
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

      request.body = {
        ...updatedPremises,
        turnaroundWorkingDays: `${updatedPremises.turnaroundWorkingDayCount}`,
      }

      premisesService.updatePremises.mockResolvedValue(premises)

      await requestHandler(request, response, next)

      expect(premisesService.updatePremises).toHaveBeenCalledWith(callConfig, premises.id, { ...updatedPremises })
      expect(request.flash).toHaveBeenCalledWith('success', 'Property edited')
      expect(response.redirect).toHaveBeenCalledWith(paths.premises.show({ premisesId: premises.id }))
    })

    it('should fail to update a premises when the service returns an error', async () => {
      const requestHandler = premisesController.update()

      const premisesId = '789f2246-0b90-43ba-b394-6b2433591c92'
      const updatedPremises = cas3UpdatePremisesFactory.build()

      request.params.premisesId = premisesId

      request.body = {
        ...updatedPremises,
        turnaroundWorkingDays: `${updatedPremises.turnaroundWorkingDayCount}`,
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
        paths.premises.edit({ premisesId }),
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
      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/v2/premises/archive', {
        premises,
        errors: {},
        errorSummary: [],
        archiveOption: 'today',
      })
    })

    it('should render the form with errors and user input when the backend returns an error', async () => {
      premisesService.getSinglePremises.mockResolvedValue(premises)

      const requestHandler = premisesController.archive()
      const errorsAndUserInput = createMock<ErrorsAndUserInput>()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue(errorsAndUserInput)

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/v2/premises/archive', {
        premises,
        errors: errorsAndUserInput.errors,
        errorSummary: errorsAndUserInput.errorSummary,
        ...errorsAndUserInput.userInput,
        archiveOption: 'today',
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
      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/v2/premises/cannot-archive', {
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
      expect(response.redirect).toHaveBeenCalledWith(paths.premises.show({ premisesId: premises.id }))
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
        paths.premises.archive({ premisesId: premises.id }),
        'premisesArchive',
        mergeParameters,
      )

      expect(generateMergeParameters).toHaveBeenCalled()
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
      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/v2/premises/unarchive', {
        premises,
        errors: {},
        errorSummary: [],
        unarchiveOption: 'today',
      })
    })

    it('should render the form with errors and user input when the backend returns an error', async () => {
      premisesService.getSinglePremises.mockResolvedValue(premises)

      const requestHandler = premisesController.unarchive()
      const errorsAndUserInput = createMock<ErrorsAndUserInput>()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue(errorsAndUserInput)

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/v2/premises/unarchive', {
        premises,
        errors: errorsAndUserInput.errors,
        errorSummary: errorsAndUserInput.errorSummary,
        ...errorsAndUserInput.userInput,
        unarchiveOption: 'today',
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
      expect(response.redirect).toHaveBeenCalledWith(paths.premises.show({ premisesId: premises.id }))
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
        paths.premises.unarchive({ premisesId: premises.id }),
        'premisesUnarchive',
      )
    })
  })
})
