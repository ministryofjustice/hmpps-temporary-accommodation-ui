import type { Request, Response, NextFunction } from 'express'
import { createMock, DeepMocked } from '@golevelup/ts-jest'

import type { ErrorsAndUserInput } from '@approved-premises/ui'

import CancellationService from '../../services/cancellationService'
import BookingService from '../../services/bookingService'
import CancellationsController from './cancellationsController'
import { fetchErrorsAndUserInput, catchValidationErrorOrPropogate } from '../../utils/validation'

import bookingFactory from '../../testutils/factories/booking'
import cancellationFactory from '../../testutils/factories/cancellation'
import referenceDataFactory from '../../testutils/factories/referenceData'
import paths from '../../paths/manage'

jest.mock('../../utils/validation')

describe('cancellationsController', () => {
  const token = 'SOME_TOKEN'

  const request: DeepMocked<Request> = createMock<Request>({ user: { token } })
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const premisesId = 'premisesId'
  const bookingId = 'bookingId'

  const booking = bookingFactory.build()
  const cancellationReasons = referenceDataFactory.buildList(4)

  const cancellationService = createMock<CancellationService>({})
  const bookingService = createMock<BookingService>({})

  const cancellationsController = new CancellationsController(cancellationService, bookingService)

  beforeEach(() => {
    bookingService.find.mockResolvedValue(booking)
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
        pageHeading: 'Cancel this placement',
        errors: {},
        errorSummary: [],
      })

      expect(bookingService.find).toHaveBeenCalledWith(token, premisesId, bookingId)
      expect(cancellationService.getCancellationReasons).toHaveBeenCalledWith(token)
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
        pageHeading: 'Cancel this placement',
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
        date: '2022-12-11',
      }

      expect(cancellationService.createCancellation).toHaveBeenCalledWith(
        token,
        request.params.premisesId,
        request.params.bookingId,
        expectedCancellation,
      )

      expect(response.redirect).toHaveBeenCalledWith(
        paths.bookings.cancellations.confirm({
          bookingId: request.params.bookingId,
          premisesId: request.params.premisesId,
          id: cancellation.id,
        }),
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
        paths.bookings.cancellations.new({
          bookingId: request.params.bookingId,
          premisesId: request.params.premisesId,
        }),
      )
    })
  })

  describe('confirm', () => {
    it('renders the confirmation page with the details from the cancellation that is requested', async () => {
      const cancellation = cancellationFactory.build()

      cancellationService.getCancellation.mockResolvedValue(cancellation)

      const requestHandler = cancellationsController.confirm()

      await requestHandler(
        {
          ...request,
          params: {
            premisesId,
            bookingId,
            id: cancellation.id,
          },
        },
        response,
        next,
      )

      expect(cancellationService.getCancellation).toHaveBeenCalledWith(token, premisesId, bookingId, cancellation.id)
      expect(bookingService.find).toHaveBeenCalledWith(token, premisesId, bookingId)

      expect(response.render).toHaveBeenCalledWith('cancellations/confirm', {
        cancellation,
        booking,
        premisesId,
        pageHeading: 'Cancellation complete',
      })
    })
  })
})
