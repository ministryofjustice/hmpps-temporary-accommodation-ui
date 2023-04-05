import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import BookingSearchController from './bookingSearchController'
import { CallConfig } from '../../../data/restClient'
import { BookingSearchService } from '../../../services'
import extractCallConfig from '../../../utils/restUtils'
import { createSideNavArr } from '../../../utils/bookingSearchUtils'

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
  })

  describe('index', () => {
    it('renders the table view for provisional bookings', async () => {
      bookingSearchService.getTableRowsForFindBooking.mockResolvedValue([])

      const requestHandler = bookingSearchController.index('provisional')

      await requestHandler(request, response, next)

      expect(bookingSearchService.getTableRowsForFindBooking).toHaveBeenCalledWith(callConfig, 'provisional')

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/booking-search/provisional', {
        bookingTableRows: [],
        sideNavArr: [],
      })
    })

    it('renders the table view for active bookings', async () => {
      bookingSearchService.getTableRowsForFindBooking.mockResolvedValue([])

      const requestHandler = bookingSearchController.index('active')

      await requestHandler(request, response, next)

      expect(bookingSearchService.getTableRowsForFindBooking).toHaveBeenCalledWith(callConfig, 'active')

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/booking-search/active', {
        bookingTableRows: [],
        sideNavArr: [],
      })
    })

    it('renders the table view for confirmed bookings', async () => {
      bookingSearchService.getTableRowsForFindBooking.mockResolvedValue([])

      const requestHandler = bookingSearchController.index('confirmed')

      await requestHandler(request, response, next)

      expect(bookingSearchService.getTableRowsForFindBooking).toHaveBeenCalledWith(callConfig, 'confirmed')

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/booking-search/confirmed', {
        bookingTableRows: [],
        sideNavArr: [],
      })
    })

    it('renders the table view for closed bookings', async () => {
      bookingSearchService.getTableRowsForFindBooking.mockResolvedValue([])

      const requestHandler = bookingSearchController.index('closed')

      await requestHandler(request, response, next)

      expect(bookingSearchService.getTableRowsForFindBooking).toHaveBeenCalledWith(callConfig, 'closed')

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/booking-search/closed', {
        bookingTableRows: [],
        sideNavArr: [],
      })
    })
  })
})
