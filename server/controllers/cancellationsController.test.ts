import type { Request, Response, NextFunction } from 'express'
import { createMock, DeepMocked } from '@golevelup/ts-jest'

import type { ErrorsAndUserInput } from 'approved-premises'

import CancellationService from '../services/cancellationService'
import BookingService from '../services/bookingService'
import CancellationsController from './cancellationsController'
import { fetchErrorsAndUserInput, catchValidationErrorOrPropogate } from '../utils/validation'

import bookingFactory from '../testutils/factories/booking'
import cancellationFactory from '../testutils/factories/cancellation'
import referenceDataFactory from '../testutils/factories/referenceData'

jest.mock('../utils/validation')

describe('cancellationsController', () => {
  const request: DeepMocked<Request> = createMock<Request>({})
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  let cancellationsController: CancellationsController

  let cancellationService: DeepMocked<CancellationService>
  let bookingService: DeepMocked<BookingService>

  const premisesId = 'premisesId'
  const bookingId = 'bookingId'
  const booking = bookingFactory.build()
  const cancellationReasons = referenceDataFactory.buildList(4)

  beforeEach(() => {
    jest.resetAllMocks()

    cancellationService = createMock<CancellationService>({})
    bookingService = createMock<BookingService>({})

    cancellationsController = new CancellationsController(cancellationService, bookingService)

    bookingService.getBooking.mockResolvedValue(booking)
    cancellationService.getCancellationReasons.mockResolvedValue(cancellationReasons)
  })

  describe('new', () => {
    it('should render the form', async () => {
      ;(fetchErrorsAndUserInput as jest.Mock).mockImplementation(() => {
        return { errors: {}, errorSummary: [], userInput: {} }
      })

      const requestHandler = cancellationsController.new()

      await requestHandler({ ...request, params: { premisesId, bookingId } }, response, next)

      expect(response.render).toHaveBeenCalledWith('cancellations/new', {
        premisesId,
        bookingId,
        booking,
        cancellationReasons,
        errors: {},
        errorSummary: [],
      })
    })

    it('renders the form with errors and user input if an error has been sent to the flash', async () => {
      const errorsAndUserInput = createMock<ErrorsAndUserInput>()

      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue(errorsAndUserInput)

      const requestHandler = cancellationsController.new()

      await requestHandler({ ...request, params: { premisesId, bookingId } }, response, next)

      expect(response.render).toHaveBeenCalledWith('cancellations/new', {
        premisesId,
        bookingId,
        booking,
        cancellationReasons,
        errors: errorsAndUserInput.errors,
        errorSummary: errorsAndUserInput.errorSummary,
        ...errorsAndUserInput.userInput,
      })
    })
  })

  describe('create', () => {
    it('creates a Cancellation and redirects to the confirmation page', async () => {
      const cancellation = cancellationFactory.build()

      cancellationService.createCancellation.mockResolvedValue(cancellation)

      const requestHandler = cancellationsController.create()

      request.params = {
        bookingId: 'bookingId',
        premisesId: 'premisesId',
      }

      request.body = {
        'date-year': 2022,
        'date-month': 12,
        'date-day': 11,
        cancellation: {
          notes: 'Some notes',
          reason: '8b2677dd-e5d4-407a-a8f8-e2035aec9227',
        },
      }

      await requestHandler(request, response, next)

      const expectedCancellation = {
        ...request.body.cancellation,
        date: new Date(2022, 11, 11).toISOString(),
      }

      expect(cancellationService.createCancellation).toHaveBeenCalledWith(
        request.params.premisesId,
        request.params.bookingId,
        expectedCancellation,
      )

      expect(response.redirect).toHaveBeenCalledWith(
        `/premises/premisesId/bookings/bookingId/cancellations/${cancellation.id}/confirmation`,
      )
    })

    it('should catch the validation errors when the API returns an error', async () => {
      const requestHandler = cancellationsController.create()

      request.params = {
        bookingId,
        premisesId,
      }

      const err = new Error()

      cancellationService.createCancellation.mockImplementation(() => {
        throw err
      })

      await requestHandler(request, response, next)

      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        err,
        `/premises/${premisesId}/bookings/${bookingId}/cancellations/new`,
      )
    })
  })
})
