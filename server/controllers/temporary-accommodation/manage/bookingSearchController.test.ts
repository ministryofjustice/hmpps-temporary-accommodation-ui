import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import type { TableRow } from '@approved-premises/ui'
import BookingSearchController from './bookingSearchController'
import { CallConfig } from '../../../data/restClient'
import { BookingSearchService } from '../../../services'
import extractCallConfig from '../../../utils/restUtils'
import { convertApiStatusToUiStatus, createSideNavArr, createTableHeadings } from '../../../utils/bookingSearchUtils'
import { PaginatedResponse } from '../../../@types/ui'

jest.mock('../../../utils/restUtils')
jest.mock('../../../utils/bookingSearchUtils')

const paginatedResponse: PaginatedResponse<TableRow> = {
  data: [],
  url: {
    params: new URLSearchParams(),
  },
  totalPages: 1,
  totalResults: 0,
  pageNumber: 1,
  pageSize: 10,
}

describe('BookingSearchController', () => {
  const callConfig = { token: 'some-call-config-token' } as CallConfig

  let request: Request

  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const bookingSearchService = createMock<BookingSearchService>({})

  const bookingSearchController = new BookingSearchController(bookingSearchService)

  beforeEach(() => {
    paginatedResponse.url.params.delete('sortOrder')
    request = createMock<Request>({ query: { page: '1', sortBy: 'endDate' } })
    ;(extractCallConfig as jest.MockedFn<typeof extractCallConfig>).mockReturnValue(callConfig)
    ;(createSideNavArr as jest.MockedFn<typeof createSideNavArr>).mockReturnValue([])
    ;(createTableHeadings as jest.MockedFn<typeof createTableHeadings>).mockReturnValue([])
  })

  describe('index', () => {
    it('renders the table view for provisional bookings with ascending order', async () => {
      request = createMock<Request>({ query: { page: '1', sortBy: 'endDate', sortDirection: 'asc' } })
      paginatedResponse.url.params.set('sortOrder', 'ascending')
      bookingSearchService.getTableRowsForFindBooking.mockResolvedValue(paginatedResponse)
      ;(convertApiStatusToUiStatus as jest.MockedFn<typeof convertApiStatusToUiStatus>).mockReturnValue('provisional')

      const requestHandler = bookingSearchController.index('provisional')

      await requestHandler(request, response, next)

      expect(bookingSearchService.getTableRowsForFindBooking).toHaveBeenCalledWith(
        callConfig,
        'provisional',
        1,
        'endDate',
        'asc',
      )

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/booking-search/results', {
        uiStatus: 'provisional',
        tableHeadings: [],
        sideNavArr: [],
        response: paginatedResponse,
        pagination: {},
      })
    })

    it('renders the table view for arrived bookings', async () => {
      bookingSearchService.getTableRowsForFindBooking.mockResolvedValue(paginatedResponse)
      ;(convertApiStatusToUiStatus as jest.MockedFn<typeof convertApiStatusToUiStatus>).mockReturnValue('active')

      const requestHandler = bookingSearchController.index('arrived')

      await requestHandler(request, response, next)

      expect(bookingSearchService.getTableRowsForFindBooking).toHaveBeenCalledWith(
        callConfig,
        'arrived',
        1,
        'endDate',
        undefined,
      )

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/booking-search/results', {
        uiStatus: 'active',
        tableHeadings: [],
        sideNavArr: [],
        response: paginatedResponse,
        pagination: {},
      })
    })

    it('renders the table view for confirmed bookings', async () => {
      bookingSearchService.getTableRowsForFindBooking.mockResolvedValue(paginatedResponse)
      ;(convertApiStatusToUiStatus as jest.MockedFn<typeof convertApiStatusToUiStatus>).mockReturnValue('confirmed')

      const requestHandler = bookingSearchController.index('confirmed')

      await requestHandler(request, response, next)

      expect(bookingSearchService.getTableRowsForFindBooking).toHaveBeenCalledWith(
        callConfig,
        'confirmed',
        1,
        'endDate',
        undefined,
      )

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/booking-search/results', {
        uiStatus: 'confirmed',
        tableHeadings: [],
        sideNavArr: [],
        response: paginatedResponse,
        pagination: {},
      })
    })

    it('renders the table view for departed bookings', async () => {
      bookingSearchService.getTableRowsForFindBooking.mockResolvedValue(paginatedResponse)
      ;(convertApiStatusToUiStatus as jest.MockedFn<typeof convertApiStatusToUiStatus>).mockReturnValue('departed')

      const requestHandler = bookingSearchController.index('departed')

      await requestHandler(request, response, next)

      expect(bookingSearchService.getTableRowsForFindBooking).toHaveBeenCalledWith(
        callConfig,
        'departed',
        1,
        'endDate',
        undefined,
      )

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/booking-search/results', {
        uiStatus: 'departed',
        tableHeadings: [],
        sideNavArr: [],
        response: paginatedResponse,
        pagination: {},
      })
    })
  })
})
