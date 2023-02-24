import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import { CancellationsController } from '.'
import { CallConfig } from '../../../data/restClient'
import paths from '../../../paths/temporary-accommodation/manage'
import { BookingService, CancellationService } from '../../../services'
import bookingFactory from '../../../testutils/factories/booking'
import cancellationFactory from '../../../testutils/factories/cancellation'
import newCancellationFactory from '../../../testutils/factories/newCancellation'
import { DateFormats } from '../../../utils/dateUtils'
import extractCallConfig from '../../../utils/restUtils'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../../utils/validation'

jest.mock('../../../utils/validation')
jest.mock('../../../utils/restUtils')

describe('CancellationsController', () => {
  const callConfig = { token: 'some-call-config-token' } as CallConfig
  const premisesId = 'premisesId'
  const roomId = 'roomId'
  const bookingId = 'bookingId'

  let request: Request

  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const bookingService = createMock<BookingService>({})
  const cancellationService = createMock<CancellationService>({})

  const cancellationsController = new CancellationsController(bookingService, cancellationService)

  beforeEach(() => {
    request = createMock<Request>()
    ;(extractCallConfig as jest.MockedFn<typeof extractCallConfig>).mockReturnValue(callConfig)
  })

  describe('new', () => {
    it('renders the form prepopulated with the current departure date', async () => {
      const booking = bookingFactory.build()

      request.params = {
        premisesId,
        roomId,
        bookingId: booking.id,
      }

      bookingService.getBooking.mockResolvedValue(booking)
      cancellationService.getReferenceData.mockResolvedValue({ cancellationReasons: [] })

      const requestHandler = cancellationsController.new()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({ errors: {}, errorSummary: [], userInput: {} })

      await requestHandler(request, response, next)

      expect(bookingService.getBooking).toHaveBeenCalledWith(callConfig, premisesId, booking.id)
      expect(cancellationService.getReferenceData).toHaveBeenCalledWith(callConfig)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/cancellations/new', {
        booking,
        roomId,
        premisesId,
        allCancellationReasons: [],
        errors: {},
        ...DateFormats.convertIsoToDateAndTimeInputs(booking.departureDate, 'date'),
        errorSummary: [],
      })
    })
  })

  describe('create', () => {
    it('creates a cancellation and redirects to the show booking page', async () => {
      const requestHandler = cancellationsController.create()

      const cancellation = cancellationFactory.build()
      const newCancellation = newCancellationFactory.build({
        ...cancellation,
        reason: cancellation.reason.id,
      })

      request.params = {
        premisesId,
        roomId,
        bookingId,
      }
      request.body = {
        ...newCancellation,
        ...DateFormats.convertIsoToDateAndTimeInputs(newCancellation.date, 'date'),
      }

      cancellationService.createCancellation.mockResolvedValue(cancellation)

      await requestHandler(request, response, next)

      expect(cancellationService.createCancellation).toHaveBeenCalledWith(
        callConfig,
        premisesId,
        bookingId,
        expect.objectContaining(newCancellation),
      )

      expect(request.flash).toHaveBeenCalledWith('success', 'Booking cancelled')
      expect(response.redirect).toHaveBeenCalledWith(paths.bookings.show({ premisesId, roomId, bookingId }))
    })

    it('renders with errors if the API returns an error', async () => {
      const requestHandler = cancellationsController.create()

      const cancellation = cancellationFactory.build()
      const newCancellation = newCancellationFactory.build({
        ...cancellation,
        reason: cancellation.reason.id,
      })

      request.params = {
        premisesId,
        roomId,
        bookingId,
      }
      request.body = {
        ...newCancellation,
        ...DateFormats.convertIsoToDateAndTimeInputs(newCancellation.date, 'date'),
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
        paths.bookings.cancellations.new({ premisesId, roomId, bookingId }),
        'bookingCancellation',
      )
    })
  })
})
