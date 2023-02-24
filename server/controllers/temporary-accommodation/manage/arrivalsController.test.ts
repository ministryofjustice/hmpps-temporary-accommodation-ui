import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import { CallConfig } from '../../../data/restClient'
import paths from '../../../paths/temporary-accommodation/manage'
import { ArrivalService, BookingService } from '../../../services'
import arrivalFactory from '../../../testutils/factories/arrival'
import bookingFactory from '../../../testutils/factories/booking'
import confirmationFactory from '../../../testutils/factories/confirmation'
import newArrivalFactory from '../../../testutils/factories/newArrival'
import { DateFormats } from '../../../utils/dateUtils'
import extractCallConfig from '../../../utils/restUtils'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput, insertGenericError } from '../../../utils/validation'
import ArrivalsController from './arrivalsController'

jest.mock('../../../utils/validation')
jest.mock('../../../utils/restUtils')

describe('ArrivalsController', () => {
  const callConfig = { token: 'some-call-config-token' } as CallConfig
  const premisesId = 'premisesId'
  const roomId = 'roomId'
  const bookingId = 'bookingId'

  let request: Request

  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const bookingService = createMock<BookingService>({})
  const arrivalService = createMock<ArrivalService>({})

  const arrivalsController = new ArrivalsController(bookingService, arrivalService)

  beforeEach(() => {
    request = createMock<Request>()
    ;(extractCallConfig as jest.MockedFn<typeof extractCallConfig>).mockReturnValue(callConfig)
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

      expect(bookingService.getBooking).toHaveBeenCalledWith(callConfig, premisesId, booking.id)

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
        callConfig,
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
