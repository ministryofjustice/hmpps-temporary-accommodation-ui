import type { Request, Response, NextFunction } from 'express'
import { createMock, DeepMocked } from '@golevelup/ts-jest'

import BookingService from '../services/bookingService'
import BookingsController from './bookingsController'
import BookingFactory from '../testutils/factories/booking'

describe('bookingsController', () => {
  const request: DeepMocked<Request> = createMock<Request>({})
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

      expect(response.render).toHaveBeenCalledWith('premises/booking/new', {
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

      await requestHandler(
        {
          ...request,
          params: { premisesId: 'premisesIdParam' },
          body: {
            CRN: 'CRN',
            keyWorker: 'John Doe',
            'arrival-day': '01',
            'arrival-month': '02',
            'arrival-year': '2022',
            'expected-departure-day': '01',
            'expected-departure-month': '02',
            'expected-departure-year': '2023',
          },
          flash: mockFlash,
        },
        response,
        next,
      )
      expect(mockFlash).toHaveBeenCalledWith('info', 'Booking made successfully')

      expect(bookingService.postBooking).toHaveBeenCalledWith('premisesIdParam', {
        CRN: 'CRN',
        arrivalDate: '2022-02-01T00:00:00.000Z',
        expectedDepartureDate: '2023-02-01T00:00:00.000Z',
        keyWorker: 'John Doe',
      })

      expect(response.redirect).toHaveBeenCalledWith('/premises')
    })

    it('given the form is submitted with no data the posting of the booking is successful should redirect to the "premises" page', async () => {
      const booking = BookingFactory.build()
      bookingService.postBooking.mockResolvedValue(booking)

      const mockFlash = jest.fn()

      const requestHandler = bookingController.create()

      await requestHandler(
        {
          ...request,
          params: { premisesId: 'premisesIdParam' },
          body: {
            CRN: '',
            keyWorker: '',
            'arrival-day': '',
            'arrival-month': '',
            'arrival-year': '',
            'expected-departure-day': '',
            'expected-departure-month': '',
            'expected-departure-year': '',
          },
          flash: mockFlash,
        },
        response,
        next,
      )
      expect(mockFlash).toHaveBeenCalledWith('info', 'Booking made successfully')

      expect(bookingService.postBooking).toHaveBeenCalledWith('premisesIdParam', {
        CRN: '',
        arrivalDate: '1899-12-31T00:00:00.000Z',
        expectedDepartureDate: '1899-12-31T00:00:00.000Z',
        keyWorker: '',
      })

      expect(response.redirect).toHaveBeenCalledWith('/premises')
    })

    it('given the form is submitted with unexpected values the posting of the booking is successful should redirect to the "premises" page', async () => {
      const booking = BookingFactory.build()
      bookingService.postBooking.mockResolvedValue(booking)

      const mockFlash = jest.fn()

      const requestHandler = bookingController.create()

      await requestHandler(
        {
          ...request,
          params: { premisesId: 'premisesIdParam' },
          body: {
            CRN: '££$%£$£',
            keyWorker: '[]',
            'arrival-day': 'monday',
            'arrival-month': '££',
            'arrival-year': 'lorem ipsum',
            'expected-departure-day': 'foo',
            'expected-departure-month': 'bar',
            'expected-departure-year': 'b4z',
          },
          flash: mockFlash,
        },
        response,
        next,
      )
      expect(mockFlash).toHaveBeenCalledWith('info', 'Booking made successfully')

      expect(bookingService.postBooking).toHaveBeenCalledWith('premisesIdParam', {
        CRN: '££$%£$£',
        arrivalDate: '1899-12-31T00:00:00.000Z',
        expectedDepartureDate: '1899-12-31T00:00:00.000Z',
        keyWorker: '[]',
      })

      expect(response.redirect).toHaveBeenCalledWith('/premises')
    })
  })
})
