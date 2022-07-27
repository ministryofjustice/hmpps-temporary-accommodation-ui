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
      requestHandler({ ...request, params: { premisesId: 'premisesIdParam' } }, response, next)

      expect(response.render).toHaveBeenCalledWith('premises/bookings/new', {
        premisesId: 'premisesIdParam',
      })
    })
  })

  describe('create', () => {
    it('given the expected form data, the posting of the booking is successful should redirect to the "premises" page', async () => {
      const booking = BookingFactory.build()
      bookingService.postBooking.mockResolvedValue(booking)
      const mockFlash = jest.fn()
      const requestHandler = bookingController.create()

      request = {
        ...request,
        params: { premisesId: 'premisesIdParam' },
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
        flash: mockFlash,
      }

      await requestHandler(request, response, next)
      expect(mockFlash).toHaveBeenCalledWith('info', 'Booking made successfully')

      expect(bookingService.postBooking).toHaveBeenCalledWith('premisesIdParam', {
        ...request.body,
        arrivalDate: '2022-02-01T00:00:00.000Z',
        expectedDepartureDate: '2023-02-01T00:00:00.000Z',
      })

      expect(response.redirect).toHaveBeenCalledWith('/premises')
    })

    it('given the form is submitted with no data the posting of the booking is successful should redirect to the "premises" page', async () => {
      const booking = BookingFactory.build()
      bookingService.postBooking.mockResolvedValue(booking)

      const mockFlash = jest.fn()

      const requestHandler = bookingController.create()

      request = {
        ...request,
        params: { premisesId: 'premisesIdParam' },
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
        flash: mockFlash,
      }

      await requestHandler(request, response, next)
      expect(mockFlash).toHaveBeenCalledWith('info', 'Booking made successfully')

      expect(bookingService.postBooking).toHaveBeenCalledWith('premisesIdParam', {
        ...request.body,
        arrivalDate: '',
        expectedDepartureDate: '',
      })

      expect(response.redirect).toHaveBeenCalledWith('/premises')
    })

    it('given the form is submitted with unexpected values the posting of the booking is successful should redirect to the "premises" page', async () => {
      const booking = BookingFactory.build()
      bookingService.postBooking.mockResolvedValue(booking)

      const mockFlash = jest.fn()

      const requestHandler = bookingController.create()
      request = {
        ...request,
        params: { premisesId: 'premisesIdParam' },
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
        flash: mockFlash,
      }

      await requestHandler(request, response, next)
      expect(mockFlash).toHaveBeenCalledWith('info', 'Booking made successfully')

      expect(bookingService.postBooking).toHaveBeenCalledWith('premisesIdParam', {
        ...request.body,
        arrivalDate: 'lorem ipsum-££-ayT00:00:00.000Z',
        expectedDepartureDate: 'b4z-ar-ooT00:00:00.000Z',
      })

      expect(response.redirect).toHaveBeenCalledWith('/premises')
    })
  })
})
