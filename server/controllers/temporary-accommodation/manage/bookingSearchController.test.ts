import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import { BookingSearchApiStatus, PaginatedResponse } from '@approved-premises/ui'
import type { TableRow } from '@approved-premises/ui'
import { ParsedQs } from 'qs'
import BookingSearchController from './bookingSearchController'
import { CallConfig } from '../../../data/restClient'
import { BookingSearchService } from '../../../services'
import { bookingSearchParametersFactory } from '../../../testutils/factories'
import extractCallConfig from '../../../utils/restUtils'
import { convertApiStatusToUiStatus, createSubNavArr, createTableHeadings } from '../../../utils/bookingSearchUtils'
import { fetchErrorsAndUserInput } from '../../../utils/validation'

jest.mock('../../../utils/restUtils')
jest.mock('../../../utils/bookingSearchUtils')
jest.mock('../../../utils/validation')

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
    request = createMock<Request>({ query: {} })
    ;(extractCallConfig as jest.MockedFn<typeof extractCallConfig>).mockReturnValue(callConfig)
    ;(createSubNavArr as jest.MockedFn<typeof createSubNavArr>).mockReturnValue([])
    ;(createTableHeadings as jest.MockedFn<typeof createTableHeadings>).mockReturnValue([])
    ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({ errors: {}, errorSummary: [] })
  })

  describe('index', () => {
    it('renders the table view for provisional bookings ordered by end date ascending', async () => {
      request = createMock<Request>({ query: { page: '1', sortBy: 'endDate', sortDirection: 'asc' } })
      paginatedResponse.url.params.set('sortOrder', 'ascending')
      bookingSearchService.getTableRowsForFindBooking.mockResolvedValue(paginatedResponse)
      ;(convertApiStatusToUiStatus as jest.MockedFn<typeof convertApiStatusToUiStatus>).mockReturnValue('provisional')

      const requestHandler = bookingSearchController.index('provisional')

      await requestHandler(request, response, next)

      expect(bookingSearchService.getTableRowsForFindBooking).toHaveBeenCalledWith(callConfig, 'provisional', {
        page: '1',
        sortBy: 'endDate',
        sortDirection: 'asc',
      })

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/booking-search/results', {
        uiStatus: 'provisional',
        tableHeadings: [],
        subNavArr: [],
        response: paginatedResponse,
        pagination: {},
      })
    })

    it('renders the table view for arrived bookings', async () => {
      bookingSearchService.getTableRowsForFindBooking.mockResolvedValue(paginatedResponse)
      ;(convertApiStatusToUiStatus as jest.MockedFn<typeof convertApiStatusToUiStatus>).mockReturnValue('active')

      const requestHandler = bookingSearchController.index('arrived')

      await requestHandler(request, response, next)

      expect(bookingSearchService.getTableRowsForFindBooking).toHaveBeenCalledWith(callConfig, 'arrived', {})

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/booking-search/results', {
        uiStatus: 'active',
        tableHeadings: [],
        subNavArr: [],
        response: paginatedResponse,
        pagination: {},
      })
    })

    it('renders the table view for confirmed bookings', async () => {
      bookingSearchService.getTableRowsForFindBooking.mockResolvedValue(paginatedResponse)
      ;(convertApiStatusToUiStatus as jest.MockedFn<typeof convertApiStatusToUiStatus>).mockReturnValue('confirmed')

      const requestHandler = bookingSearchController.index('confirmed')

      await requestHandler(request, response, next)

      expect(bookingSearchService.getTableRowsForFindBooking).toHaveBeenCalledWith(callConfig, 'confirmed', {})

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/booking-search/results', {
        uiStatus: 'confirmed',
        tableHeadings: [],
        subNavArr: [],
        response: paginatedResponse,
        pagination: {},
      })
    })

    it('renders the table view for 3rd page of departed bookings', async () => {
      request = createMock<Request>({ query: { page: '3' } })
      bookingSearchService.getTableRowsForFindBooking.mockResolvedValue(paginatedResponse)
      ;(convertApiStatusToUiStatus as jest.MockedFn<typeof convertApiStatusToUiStatus>).mockReturnValue('departed')

      const requestHandler = bookingSearchController.index('departed')

      await requestHandler(request, response, next)

      expect(bookingSearchService.getTableRowsForFindBooking).toHaveBeenCalledWith(callConfig, 'departed', {
        page: '3',
      })

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/booking-search/results', {
        uiStatus: 'departed',
        tableHeadings: [],
        subNavArr: [],
        response: paginatedResponse,
        pagination: {},
      })
    })

    describe('when there is a CRN or Name search parameter', () => {
      it.each(['provisional', 'confirmed', 'active', 'departed'])(
        'renders the filtered table view for %s bookings',
        async uiStatus => {
          const status = (uiStatus === 'active' ? 'arrived' : uiStatus) as BookingSearchApiStatus
          const searchParameters = bookingSearchParametersFactory.build()

          ;(convertApiStatusToUiStatus as jest.MockedFn<typeof convertApiStatusToUiStatus>).mockReturnValue(uiStatus)

          request.query = searchParameters as ParsedQs

          const requestHandler = bookingSearchController.index(status)

          await requestHandler(request, response, next)

          expect(bookingSearchService.getTableRowsForFindBooking).toHaveBeenCalledWith(
            callConfig,
            status,
            searchParameters,
          )

          expect(response.render).toHaveBeenCalledWith('temporary-accommodation/booking-search/results', {
            uiStatus,
            tableHeadings: [],
            subNavArr: [],
            crnOrName: searchParameters.crnOrName,
            response: paginatedResponse,
            pagination: {},
          })
        },
      )
    })
  })
})
