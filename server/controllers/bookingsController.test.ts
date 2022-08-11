import type { Request, Response, NextFunction } from 'express'
import { createMock, DeepMocked } from '@golevelup/ts-jest'

import BookingService from '../services/bookingService'
import BookingsController from './bookingsController'
import renderWithErrors from '../utils/validation'

import bookingFactory from '../testutils/factories/booking'

jest.mock('../utils/validation')

describe('bookingsController', () => {
  let request: DeepMocked<Request> = createMock<Request>({})
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  let bookingController: BookingsController
  let bookingService: DeepMocked<BookingService>

  beforeEach(() => {
    jest.resetAllMocks()

    bookingService = createMock<BookingService>({})
    bookingController = new BookingsController(bookingService)
  })

  describe('new', () => {
    it('should render the form', async () => {
      const requestHandler = bookingController.new()
      const premisesId = 'premisesId'
      requestHandler({ ...request, params: { premisesId } }, response, next)

      expect(response.render).toHaveBeenCalledWith('premises/bookings/new', {
        premisesId,
      })
    })
  })

  describe('create', () => {
    it('given the expected form data, the posting of the booking is successful should redirect to the "premises" page', async () => {
      const booking = bookingFactory.build()
      bookingService.postBooking.mockResolvedValue(booking)
      const premisesId = 'premisesId'
      const requestHandler = bookingController.create()

      request = {
        ...request,
        params: { premisesId },
        body: {
          CRN: 'CRN',
          keyWorker: 'John Doe',
          'arrivalDate-day': '01',
          'arrivalDate-month': '02',
          'arrivalDate-year': '2022',
          'expectedDepartureDate-day': '01',
          'expectedDepartureDate-month': '02',
          'expectedDepartureDate-year': '2023',
        },
      }

      await requestHandler(request, response, next)

      expect(bookingService.postBooking).toHaveBeenCalledWith(premisesId, {
        ...request.body,
        arrivalDate: '2022-02-01T00:00:00.000Z',
        expectedDepartureDate: '2023-02-01T00:00:00.000Z',
      })

      expect(response.redirect).toHaveBeenCalledWith(`/premises/${premisesId}/bookings/${booking.id}/confirmation`)
    })

    it('should render the page with errors when the API returns an error', async () => {
      const booking = bookingFactory.build()
      bookingService.postBooking.mockResolvedValue(booking)
      const requestHandler = bookingController.create()
      const premisesId = 'premisesId'

      request = {
        ...request,
        params: { premisesId },
      }

      const err = new Error()

      bookingService.postBooking.mockImplementation(() => {
        throw err
      })

      await requestHandler(request, response, next)

      expect(renderWithErrors).toHaveBeenCalledWith(request, response, err, `premises/bookings/new`, { premisesId })
    })
  })

  describe('confirm', () => {
    it('renders the form with the details from the booking that is requested', async () => {
      const booking = bookingFactory.build({
        arrivalDate: new Date('07/27/22').toISOString(),
        expectedDepartureDate: new Date('07/28/22').toISOString(),
      })
      bookingService.getBooking.mockResolvedValue(booking)
      const premisesId = 'premisesId'
      const requestHandler = bookingController.confirm()

      request = {
        ...request,
        params: {
          premisesId,
          bookingId: booking.id,
        },
      }

      await requestHandler(request, response, next)

      expect(bookingService.getBooking).toHaveBeenCalledWith(premisesId, booking.id)
      expect(response.render).toHaveBeenCalledWith('premises/bookings/confirm', booking)
    })
  })
})
