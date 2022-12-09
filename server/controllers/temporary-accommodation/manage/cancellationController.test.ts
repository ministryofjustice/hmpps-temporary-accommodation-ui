import type { Request, Response, NextFunction } from 'express'
import { createMock, DeepMocked } from '@golevelup/ts-jest'
import paths from '../../../paths/temporary-accommodation/manage'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../../utils/validation'
import bookingFactory from '../../../testutils/factories/booking'
import { BookingService, CancellationService } from '../../../services'
import { DateFormats } from '../../../utils/dateUtils'
import { CancellationsController } from '.'
import cancellationFactory from '../../../testutils/factories/cancellation'
import newCancellationFactory from '../../../testutils/factories/newCancellation'

jest.mock('../../../utils/validation')

describe('CancellationsController', () => {
  const token = 'SOME_TOKEN'
  const premisesId = 'premisesId'
  const roomId = 'roomId'
  const bookingId = 'bookingId'

  let request: DeepMocked<Request>

  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const bookingService = createMock<BookingService>({})
  const cancellationService = createMock<CancellationService>({})

  const cancellationsController = new CancellationsController(bookingService, cancellationService)

  beforeEach(() => {
    request = createMock<Request>({ user: { token } })
  })

  describe('new', () => {
    it('renders the form prepopulated with the current departure date', async () => {
      const booking = bookingFactory.build()

      request.params = {
        premisesId,
        roomId,
        bookingId: booking.id,
      }

      bookingService.getBookingDetails.mockResolvedValue({ booking, summaryList: { rows: [] } })
      cancellationService.getReferenceData.mockResolvedValue({ cancellationReasons: [] })

      const requestHandler = cancellationsController.new()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({ errors: {}, errorSummary: [], userInput: {} })

      await requestHandler(request, response, next)

      expect(bookingService.getBookingDetails).toHaveBeenCalledWith(token, premisesId, booking.id)
      expect(cancellationService.getReferenceData).toHaveBeenCalledWith(token)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/cancellations/new', {
        booking,
        summaryList: { rows: [] },
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
        token,
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
