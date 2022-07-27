import type { Request, Response, NextFunction } from 'express'
import { createMock, DeepMocked } from '@golevelup/ts-jest'

import BookingService from '../services/bookingService'
import BookingsController from './bookingsController'
import BookingFactory from '../testutils/factories/booking'

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
      const booking = BookingFactory.build()
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

    it('given the form is submitted with no data the posting of the booking is successful should redirect to the "premises" page', async () => {
      const booking = BookingFactory.build()
      bookingService.postBooking.mockResolvedValue(booking)
      const premisesId = 'premisesId'
      const requestHandler = bookingController.create()

      request = {
        ...request,
        params: { premisesId },
        body: {
          CRN: '',
          keyWorker: '',
          'arrivalDate-day': '',
          'arrivalDate-month': '',
          'arrivalDate-year': '',
          'expectedDepartureDate-day': '',
          'expectedDepartureDate-month': '',
          'expectedDepartureDate-year': '',
        },
      }

      await requestHandler(request, response, next)

      expect(bookingService.postBooking).toHaveBeenCalledWith(premisesId, {
        ...request.body,
        arrivalDate: '',
        expectedDepartureDate: '',
      })

      expect(response.redirect).toHaveBeenCalledWith(`/premises/${premisesId}/bookings/${booking.id}/confirmation`)
    })

    it('given the form is submitted with unexpected values the posting of the booking is successful should redirect to the "premises" page', async () => {
      const booking = BookingFactory.build()
      bookingService.postBooking.mockResolvedValue(booking)
      const premisesId = 'premisesId'
      const requestHandler = bookingController.create()

      request = {
        ...request,
        params: { premisesId },
        body: {
          CRN: '££$%£$£',
          keyWorker: '[]',
          'arrivalDate-day': 'monday',
          'arrivalDate-month': '££',
          'arrivalDate-year': 'lorem ipsum',
          'expectedDepartureDate-day': 'foo',
          'expectedDepartureDate-month': 'bar',
          'expectedDepartureDate-year': 'b4z',
        },
      }

      await requestHandler(request, response, next)

      expect(bookingService.postBooking).toHaveBeenCalledWith(premisesId, {
        ...request.body,
        arrivalDate: 'lorem ipsum-££-ayT00:00:00.000Z',
        expectedDepartureDate: 'b4z-ar-ooT00:00:00.000Z',
      })

      expect(response.redirect).toHaveBeenCalledWith(`/premises/${premisesId}/bookings/${booking.id}/confirmation`)
    })
  })

  describe('confirm', () => {
    it('renders the form with the details from the booking that is requested', async () => {
      const booking = BookingFactory.build({
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
