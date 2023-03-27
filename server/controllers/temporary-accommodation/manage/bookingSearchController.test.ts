import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import BookingSearchController from './bookingSearchController'
import { CallConfig } from '../../../data/restClient'
import { BookingSearchService } from '../../../services'
import extractCallConfig from '../../../utils/restUtils'

jest.mock('../../../utils/restUtils')

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
  })

  describe('index', () => {
    it('renders the table view of all bookings', async () => {
      bookingSearchService.getTableRowsForFindBooking.mockResolvedValue([])

      const requestHandler = bookingSearchController.index()

      await requestHandler(request, response, next)

      expect(bookingSearchService.getTableRowsForFindBooking).toHaveBeenCalledWith(callConfig)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/bookingSearch/index', {
        bookingTableRows: [],
      })
    })
  })
})
