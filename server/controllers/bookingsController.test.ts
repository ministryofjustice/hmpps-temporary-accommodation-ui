import type { Request, Response, NextFunction } from 'express'
import { createMock, DeepMocked } from '@golevelup/ts-jest'

import type { ErrorsAndUserInput } from 'approved-premises'
import BookingService from '../services/bookingService'
import BookingsController from './bookingsController'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../utils/validation'

import bookingFactory from '../testutils/factories/booking'

jest.mock('../utils/validation')

describe('bookingsController', () => {
  const token = 'SOME_TOKEN'

  let request: DeepMocked<Request> = createMock<Request>({ user: { token } })
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const bookingService = createMock<BookingService>({})
  const bookingController = new BookingsController(bookingService)

  describe('show', () => {
    it('should fetch the booking and render the show page', async () => {
      const booking = bookingFactory.build()
      bookingService.getBooking.mockResolvedValue(booking)

      const requestHandler = bookingController.show()
      const premisesId = 'premisesId'
      const bookingId = 'bookingId'

      await requestHandler({ ...request, params: { premisesId, bookingId } }, response, next)

      expect(response.render).toHaveBeenCalledWith('bookings/show', {
        booking,
        premisesId,
        pageHeading: 'Booking details',
      })

      expect(bookingService.getBooking).toHaveBeenCalledWith(token, premisesId, bookingId)
    })
  })

  describe('new', () => {
    it('should render the form', async () => {
      const requestHandler = bookingController.new()
      const premisesId = 'premisesId'
      ;(fetchErrorsAndUserInput as jest.Mock).mockImplementation(() => {
        return { errors: {}, errorSummary: [], userInput: {} }
      })

      requestHandler({ ...request, params: { premisesId } }, response, next)

      expect(response.render).toHaveBeenCalledWith('bookings/new', {
        premisesId,
        pageHeading: 'Make a booking',
        errors: {},
        errorSummary: [],
      })
    })

    it('renders the form with errors and user input if an error has been sent to the flash', () => {
      const requestHandler = bookingController.new()
      const premisesId = 'premisesId'

      const errorsAndUserInput = createMock<ErrorsAndUserInput>()

      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue(errorsAndUserInput)

      requestHandler({ ...request, params: { premisesId } }, response, next)

      expect(response.render).toHaveBeenCalledWith('bookings/new', {
        premisesId,
        pageHeading: 'Make a booking',
        errors: errorsAndUserInput.errors,
        errorSummary: errorsAndUserInput.errorSummary,
        ...errorsAndUserInput.userInput,
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
          'expectedArrivalDate-day': '01',
          'expectedArrivalDate-month': '02',
          'expectedArrivalDate-year': '2022',
          'expectedDepartureDate-day': '01',
          'expectedDepartureDate-month': '02',
          'expectedDepartureDate-year': '2023',
        },
      }

      await requestHandler(request, response, next)

      expect(bookingService.postBooking).toHaveBeenCalledWith(token, premisesId, {
        ...request.body,
        expectedArrivalDate: '2022-02-01T00:00:00.000Z',
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

      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        err,
        `/premises/${premisesId}/bookings/new`,
      )
    })
  })

  describe('confirm', () => {
    it('renders the form with the details from the booking that is requested', async () => {
      const booking = bookingFactory.build({
        expectedArrivalDate: new Date('07/27/22').toISOString(),
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

      expect(bookingService.getBooking).toHaveBeenCalledWith(token, premisesId, booking.id)
      expect(response.render).toHaveBeenCalledWith('bookings/confirm', {
        premisesId,
        pageHeading: 'Booking complete',
        bookingId: booking.id,
        ...booking,
      })
    })
  })
})
