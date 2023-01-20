import type { Response, NextFunction } from 'express'
import { createMock, DeepMocked } from '@golevelup/ts-jest'
import paths from '../../../paths/temporary-accommodation/manage'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../../utils/validation'
import bookingFactory from '../../../testutils/factories/booking'
import { BookingService } from '../../../services'
import ConfirmationsController from './confirmationsController'
import ConfirmationService from '../../../services/confirmationService'
import confirmationFactory from '../../../testutils/factories/confirmation'
import newConfirmationFactory from '../../../testutils/factories/newConfirmation'
import { createMockRequest, MockRequest } from '../../../testutils/createMockRequest'

jest.mock('../../../utils/validation')

describe('ConfirmationsController', () => {
  const premisesId = 'premisesId'
  const roomId = 'roomId'
  const bookingId = 'bookingId'

  let request: MockRequest

  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const bookingService = createMock<BookingService>({})
  const confirmationService = createMock<ConfirmationService>({})

  const confirmationsController = new ConfirmationsController(bookingService, confirmationService)

  beforeEach(() => {
    request = createMockRequest()
  })

  describe('new', () => {
    it('renders the form', async () => {
      const booking = bookingFactory.build()

      request.params = {
        premisesId,
        roomId,
        bookingId: booking.id,
      }

      bookingService.getBooking.mockResolvedValue(booking)

      const requestHandler = confirmationsController.new()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({ errors: {}, errorSummary: [], userInput: {} })

      await requestHandler(request, response, next)

      expect(bookingService.getBooking).toHaveBeenCalledWith(request, premisesId, booking.id)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/confirmations/new', {
        booking,
        roomId,
        premisesId,
        errors: {},
        errorSummary: [],
      })
    })
  })

  describe('create', () => {
    it('creates a confirmation and redirects to the show booking page', async () => {
      const requestHandler = confirmationsController.create()

      const confirmation = confirmationFactory.build()
      const newConfirmation = newConfirmationFactory.build({
        ...confirmation,
      })

      request.params = {
        premisesId,
        roomId,
        bookingId,
      }
      request.body = {
        ...newConfirmation,
      }

      confirmationService.createConfirmation.mockResolvedValue(confirmation)

      await requestHandler(request, response, next)

      expect(confirmationService.createConfirmation).toHaveBeenCalledWith(
        request,
        premisesId,
        bookingId,
        newConfirmation,
      )

      expect(request.flash).toHaveBeenCalledWith('success', 'Booking confirmed')
      expect(response.redirect).toHaveBeenCalledWith(paths.bookings.show({ premisesId, roomId, bookingId }))
    })

    it('renders with errors if the API returns an error', async () => {
      const requestHandler = confirmationsController.create()

      const confirmation = confirmationFactory.build()
      const newConfirmation = newConfirmationFactory.build({
        ...confirmation,
      })

      request.params = {
        premisesId,
        roomId,
        bookingId,
      }
      request.body = {
        ...newConfirmation,
      }

      const err = new Error()
      confirmationService.createConfirmation.mockImplementation(() => {
        throw err
      })

      await requestHandler(request, response, next)

      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        err,
        paths.bookings.confirmations.new({ premisesId, roomId, bookingId }),
      )
    })
  })
})
