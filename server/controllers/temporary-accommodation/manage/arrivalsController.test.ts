import type { Request, Response, NextFunction } from 'express'
import { createMock, DeepMocked } from '@golevelup/ts-jest'
import paths from '../../../paths/temporary-accommodation/manage'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput, insertGenericError } from '../../../utils/validation'
import bookingFactory from '../../../testutils/factories/booking'
import { ArrivalService, BookingService } from '../../../services'
import confirmationFactory from '../../../testutils/factories/confirmation'
import newArrivalFactory from '../../../testutils/factories/newArrival'
import ArrivalsController from './arrivalsController'
import { DateFormats } from '../../../utils/dateUtils'
import arrivalFactory from '../../../testutils/factories/arrival'

jest.mock('../../../utils/validation')

describe('ArrivalsController', () => {
  const token = 'SOME_TOKEN'
  const premisesId = 'premisesId'
  const roomId = 'roomId'
  const bookingId = 'bookingId'

  let request: DeepMocked<Request>

  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const bookingService = createMock<BookingService>({})
  const arrivalService = createMock<ArrivalService>({})

  const arrivalsController = new ArrivalsController(bookingService, arrivalService)

  beforeEach(() => {
    request = createMock<Request>({ user: { token } })
  })

  describe('new', () => {
    it('renders the form prepopulated with the current booking dates', async () => {
      const booking = bookingFactory.build()

      request.params = {
        premisesId,
        roomId,
        bookingId: booking.id,
      }

      bookingService.getBooking.mockResolvedValue(booking)

      const requestHandler = arrivalsController.new()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({ errors: {}, errorSummary: [], userInput: {} })

      await requestHandler(request, response, next)

      expect(bookingService.getBooking).toHaveBeenCalledWith(token, premisesId, booking.id)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/arrivals/new', {
        booking,
        roomId,
        premisesId,
        errors: {},
        errorSummary: [],
        ...DateFormats.convertIsoToDateAndTimeInputs(booking.arrivalDate, 'arrivalDate'),
        ...DateFormats.convertIsoToDateAndTimeInputs(booking.departureDate, 'expectedDepartureDate'),
      })
    })
  })

  describe('create', () => {
    it('creates an arrival and redirects to the show booking page', async () => {
      const requestHandler = arrivalsController.create()

      const arrival = arrivalFactory.build()
      const newArrival = newArrivalFactory.build({
        ...arrival,
      })

      request.params = {
        premisesId,
        roomId,
        bookingId,
      }
      request.body = {
        ...newArrival,
        ...DateFormats.convertIsoToDateAndTimeInputs(newArrival.arrivalDate, 'arrivalDate'),
        ...DateFormats.convertIsoToDateAndTimeInputs(newArrival.expectedDepartureDate, 'expectedDepartureDate'),
      }

      arrivalService.createArrival.mockResolvedValue(arrival)

      await requestHandler(request, response, next)

      expect(arrivalService.createArrival).toHaveBeenCalledWith(
        token,
        premisesId,
        bookingId,
        expect.objectContaining(newArrival),
      )

      expect(request.flash).toHaveBeenCalledWith('success', 'Booking marked as active')
      expect(response.redirect).toHaveBeenCalledWith(paths.bookings.show({ premisesId, roomId, bookingId }))
    })

    it('renders with errors if the API returns an error', async () => {
      const requestHandler = arrivalsController.create()

      const arrival = confirmationFactory.build()
      const newArrival = newArrivalFactory.build({
        ...arrival,
      })

      request.params = {
        premisesId,
        roomId,
        bookingId,
      }
      request.body = {
        ...newArrival,
        ...DateFormats.convertIsoToDateAndTimeInputs(newArrival.arrivalDate, 'arrivalDate'),
        ...DateFormats.convertIsoToDateAndTimeInputs(newArrival.expectedDepartureDate, 'expectedDepartureDate'),
      }

      const err = new Error()
      arrivalService.createArrival.mockImplementation(() => {
        throw err
      })

      await requestHandler(request, response, next)

      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        err,
        paths.bookings.arrivals.new({ premisesId, roomId, bookingId }),
      )
    })

    it('renders with errors if the API returns a 409 Conflict status', async () => {
      const requestHandler = arrivalsController.create()

      const arrival = confirmationFactory.build()
      const newArrival = newArrivalFactory.build({
        ...arrival,
      })

      request.params = {
        premisesId,
        roomId,
        bookingId,
      }
      request.body = {
        ...newArrival,
        ...DateFormats.convertIsoToDateAndTimeInputs(newArrival.arrivalDate, 'arrivalDate'),
        ...DateFormats.convertIsoToDateAndTimeInputs(newArrival.expectedDepartureDate, 'expectedDepartureDate'),
      }

      const err = { status: 409 }
      arrivalService.createArrival.mockImplementation(() => {
        throw err
      })

      await requestHandler(request, response, next)

      expect(insertGenericError).toHaveBeenCalledWith(err, 'arrivalDate', 'conflict')
      expect(insertGenericError).toHaveBeenCalledWith(err, 'expectedDepartureDate', 'conflict')
      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        err,
        paths.bookings.arrivals.new({ premisesId, roomId, bookingId }),
      )
    })
  })
})
