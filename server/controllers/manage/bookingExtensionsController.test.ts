import type { Request, Response, NextFunction } from 'express'
import { createMock, DeepMocked } from '@golevelup/ts-jest'

import type { ErrorsAndUserInput } from 'approved-premises'
import BookingService from '../../services/bookingService'
import BookingExtensionsController from './bookingExtensionsController'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../utils/validation'

import bookingExtensionFactory from '../../testutils/factories/bookingExtension'
import bookingFactory from '../../testutils/factories/booking'
import paths from '../../paths/manage'

jest.mock('../../utils/validation')

describe('bookingExtensionsController', () => {
  const token = 'SOME_TOKEN'

  let request: DeepMocked<Request> = createMock<Request>({ user: { token } })
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const bookingService = createMock<BookingService>({})
  const bookingExtensionsController = new BookingExtensionsController(bookingService)
  const premisesId = 'premisesId'

  describe('new', () => {
    const booking = bookingFactory.build()

    beforeEach(() => {
      bookingService.find.mockResolvedValue(booking)
    })

    it('should render the form', async () => {
      const requestHandler = bookingExtensionsController.new()
      ;(fetchErrorsAndUserInput as jest.Mock).mockImplementation(() => {
        return { errors: {}, errorSummary: [], userInput: {} }
      })

      await requestHandler({ ...request, params: { premisesId, bookingId: booking.id } }, response, next)

      expect(response.render).toHaveBeenCalledWith('bookings/extensions/new', {
        premisesId,
        booking,
        errors: {},
        errorSummary: [],
      })
      expect(bookingService.find).toHaveBeenCalledWith(token, premisesId, booking.id)
    })

    it('renders the form with errors and user input if an error has been sent to the flash', async () => {
      bookingService.find.mockResolvedValue(booking)
      const errorsAndUserInput = createMock<ErrorsAndUserInput>()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue(errorsAndUserInput)

      const requestHandler = bookingExtensionsController.new()

      await requestHandler({ ...request, params: { premisesId, bookingId: booking.id } }, response, next)

      expect(response.render).toHaveBeenCalledWith('bookings/extensions/new', {
        premisesId,
        booking,
        errors: errorsAndUserInput.errors,
        errorSummary: errorsAndUserInput.errorSummary,
        ...errorsAndUserInput.userInput,
      })
      expect(bookingService.find).toHaveBeenCalledWith(token, premisesId, booking.id)
    })
  })

  describe('create', () => {
    const bookingExtension = bookingExtensionFactory.build()

    it('given the expected form data, the posting of the booking is successful should redirect to the "confirmation" page', async () => {
      bookingService.extendBooking.mockResolvedValue(bookingExtension)

      const requestHandler = bookingExtensionsController.create()

      request = {
        ...request,
        params: { premisesId, bookingId: bookingExtension.id },
        body: {
          'newDepartureDate-day': '01',
          'newDepartureDate-month': '02',
          'newDepartureDate-year': '2022',
        },
      }

      await requestHandler(request, response, next)

      expect(bookingService.extendBooking).toHaveBeenCalledWith(token, premisesId, bookingExtension.id, {
        ...request.body,
        newDepartureDate: '2022-02-01T00:00:00.000Z',
      })

      expect(response.redirect).toHaveBeenCalledWith(
        paths.bookings.extensions.confirm({
          premisesId,
          bookingId: bookingExtension.bookingId,
        }),
      )
    })

    it('should render the page with errors when the API returns an error', async () => {
      bookingService.extendBooking.mockResolvedValue(bookingExtension)
      const requestHandler = bookingExtensionsController.create()

      request = {
        ...request,
        params: { premisesId, bookingId: bookingExtension.id },
      }

      const err = new Error()

      bookingService.extendBooking.mockImplementation(() => {
        throw err
      })

      await requestHandler(request, response, next)

      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        err,
        paths.bookings.extensions.new({
          premisesId,
          bookingId: bookingExtension.id,
        }),
      )
    })
  })

  describe('confirm', () => {
    it('renders the form with the details from the booking that is requested', async () => {
      const booking = bookingFactory.build()
      bookingService.find.mockResolvedValue(booking)

      const requestHandler = bookingExtensionsController.confirm()

      request = {
        ...request,
        params: {
          premisesId,
          bookingId: booking.id,
        },
      }

      await requestHandler(request, response, next)

      expect(bookingService.find).toHaveBeenCalledWith(token, premisesId, booking.id)
      expect(response.render).toHaveBeenCalledWith('bookings/extensions/confirm', { premisesId, ...booking })
    })
  })
})
