import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import BookingSearchController from './bookingSearchController'
import { CallConfig } from '../../../data/restClient'
import { BookingSearchService } from '../../../services'
import extractCallConfig from '../../../utils/restUtils'
import { convertApiStatusToUiStatus, createSideNavArr, createTableHeadings } from '../../../utils/bookingSearchUtils'

jest.mock('../../../utils/restUtils')
jest.mock('../../../utils/bookingSearchUtils')

describe('BookingSearchController', () => {
  const callConfig = { token: 'some-call-config-token' } as CallConfig

  let request: Request

  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const bookingSearchService = createMock<BookingSearchService>({})

  const bookingSearchController = new BookingSearchController(bookingSearchService)

  beforeEach(() => {
    request = createMock<Request>()
    ;(extractCallConfig as jest.MockedFn<typeof extractCallConfig>).mockReturnValue(callConfig)
    ;(createSideNavArr as jest.MockedFn<typeof createSideNavArr>).mockReturnValue([])
    ;(createTableHeadings as jest.MockedFn<typeof createTableHeadings>).mockReturnValue([])
  })

  describe('index', () => {
    it('renders the table view for provisional bookings', async () => {
      bookingSearchService.getTableRowsForFindBooking.mockResolvedValue([])
      ;(convertApiStatusToUiStatus as jest.MockedFn<typeof convertApiStatusToUiStatus>).mockReturnValue('provisional')

      const requestHandler = bookingSearchController.index('provisional')

      await requestHandler(request, response, next)

      expect(bookingSearchService.getTableRowsForFindBooking).toHaveBeenCalledWith(callConfig, 'provisional')

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/booking-search/results', {
        uiStatus: 'provisional',
        tableHeadings: [],
        bookingTableRows: [],
        sideNavArr: [],
      })
    })

    it('renders the table view for arrived bookings', async () => {
      bookingSearchService.getTableRowsForFindBooking.mockResolvedValue([])
      ;(convertApiStatusToUiStatus as jest.MockedFn<typeof convertApiStatusToUiStatus>).mockReturnValue('active')

      const requestHandler = bookingSearchController.index('arrived')

      await requestHandler(request, response, next)

      expect(bookingSearchService.getTableRowsForFindBooking).toHaveBeenCalledWith(callConfig, 'arrived')

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/booking-search/results', {
        uiStatus: 'active',
        tableHeadings: [],
        bookingTableRows: [],
        sideNavArr: [],
      })
    })

    it('renders the table view for confirmed bookings', async () => {
      bookingSearchService.getTableRowsForFindBooking.mockResolvedValue([])
      ;(convertApiStatusToUiStatus as jest.MockedFn<typeof convertApiStatusToUiStatus>).mockReturnValue('confirmed')

      const requestHandler = bookingSearchController.index('confirmed')

      await requestHandler(request, response, next)

      expect(bookingSearchService.getTableRowsForFindBooking).toHaveBeenCalledWith(callConfig, 'confirmed')

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/booking-search/results', {
        uiStatus: 'confirmed',
        tableHeadings: [],
        bookingTableRows: [],
        sideNavArr: [],
      })
    })

    it('renders the table view for departed bookings', async () => {
      bookingSearchService.getTableRowsForFindBooking.mockResolvedValue([])
      ;(convertApiStatusToUiStatus as jest.MockedFn<typeof convertApiStatusToUiStatus>).mockReturnValue('departed')

      const requestHandler = bookingSearchController.index('departed')

      await requestHandler(request, response, next)

      expect(bookingSearchService.getTableRowsForFindBooking).toHaveBeenCalledWith(callConfig, 'departed')

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/booking-search/results', {
        uiStatus: 'departed',
        tableHeadings: [],
        bookingTableRows: [],
        sideNavArr: [],
      })
    })
  })
})
