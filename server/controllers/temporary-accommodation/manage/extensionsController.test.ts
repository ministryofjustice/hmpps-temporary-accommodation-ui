import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'
import paths from '../../../paths/temporary-accommodation/manage'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput, insertGenericError } from '../../../utils/validation'
import bookingFactory from '../../../testutils/factories/booking'
import { BookingService, ExtensionService } from '../../../services'
import departureFactory from '../../../testutils/factories/departure'
import newDepartureFactory from '../../../testutils/factories/newDeparture'
import { DateFormats } from '../../../utils/dateUtils'
import ExtensionsController from './extensionsController'
import extensionFactory from '../../../testutils/factories/extension'
import newExtensionFactory from '../../../testutils/factories/newExtension'
import { getLatestExtension } from '../../../utils/bookingUtils'
import { CallConfig } from '../../../data/restClient'
import extractCallConfig from '../../../utils/restUtils'

jest.mock('../../../utils/validation')
jest.mock('../../../utils/bookingUtils')
jest.mock('../../../utils/restUtils')

describe('ExtensionsController', () => {
  const callConfig = { token: 'some-call-config-token' } as CallConfig
  const premisesId = 'premisesId'
  const roomId = 'roomId'
  const bookingId = 'bookingId'

  let request: Request

  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const bookingService = createMock<BookingService>({})
  const extensionService = createMock<ExtensionService>({})

  const extensionsController = new ExtensionsController(bookingService, extensionService)

  beforeEach(() => {
    request = createMock<Request>()
    ;(extractCallConfig as jest.MockedFn<typeof extractCallConfig>).mockReturnValue(callConfig)
  })

  describe('new', () => {
    it('renders the form prepopulated with the current departure dates', async () => {
      const booking = bookingFactory.arrived().build({
        extensions: [],
      })

      request.params = {
        premisesId,
        roomId,
        bookingId: booking.id,
      }

      bookingService.getBooking.mockResolvedValue(booking)

      const requestHandler = extensionsController.new()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({ errors: {}, errorSummary: [], userInput: {} })

      await requestHandler(request, response, next)

      expect(bookingService.getBooking).toHaveBeenCalledWith(callConfig, premisesId, booking.id)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/extensions/new', {
        booking,
        roomId,
        premisesId,
        errors: {},
        ...DateFormats.convertIsoToDateAndTimeInputs(booking.departureDate, 'newDepartureDate'),
        errorSummary: [],
      })
    })

    it('renders the form prepopulated with the current departure dates and latest extension notes', async () => {
      const booking = bookingFactory.arrived().build({
        extensions: extensionFactory.buildList(2),
      })

      request.params = {
        premisesId,
        roomId,
        bookingId: booking.id,
      }

      bookingService.getBooking.mockResolvedValue(booking)
      ;(getLatestExtension as jest.MockedFunction<typeof getLatestExtension>).mockImplementation(
        bookings => bookings.extensions?.[0],
      )

      const requestHandler = extensionsController.new()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({ errors: {}, errorSummary: [], userInput: {} })

      await requestHandler(request, response, next)

      expect(bookingService.getBooking).toHaveBeenCalledWith(callConfig, premisesId, booking.id)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/extensions/new', {
        booking,
        roomId,
        premisesId,
        errors: {},
        ...DateFormats.convertIsoToDateAndTimeInputs(booking.departureDate, 'newDepartureDate'),
        notes: booking.extensions[0].notes,
        errorSummary: [],
      })
    })
  })

  describe('create', () => {
    it('creates an extension and redirects to the show booking page', async () => {
      const requestHandler = extensionsController.create()

      const extension = extensionFactory.build()
      const newExtension = newExtensionFactory.build({
        ...extensionFactory,
      })

      request.params = {
        premisesId,
        roomId,
        bookingId,
      }
      request.body = {
        ...newExtension,
        ...DateFormats.convertIsoToDateAndTimeInputs(newExtension.newDepartureDate, 'newDepartureDate'),
      }

      extensionService.createExtension.mockResolvedValue(extension)

      await requestHandler(request, response, next)

      expect(extensionService.createExtension).toHaveBeenCalledWith(
        callConfig,
        premisesId,
        bookingId,
        expect.objectContaining(newExtension),
      )

      expect(request.flash).toHaveBeenCalledWith('success', 'Booking departure date changed')
      expect(response.redirect).toHaveBeenCalledWith(paths.bookings.show({ premisesId, roomId, bookingId }))
    })

    it('renders with errors if the API returns an error', async () => {
      const requestHandler = extensionsController.create()

      const departure = departureFactory.build()
      const newDeparture = newDepartureFactory.build({
        ...departure,
      })

      request.params = {
        premisesId,
        roomId,
        bookingId,
      }
      request.body = {
        ...newDeparture,
        ...DateFormats.convertIsoToDateAndTimeInputs(newDeparture.dateTime, 'newDepartureDate'),
      }

      const err = new Error()
      extensionService.createExtension.mockImplementation(() => {
        throw err
      })

      await requestHandler(request, response, next)

      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        err,
        paths.bookings.extensions.new({ premisesId, roomId, bookingId }),
      )
    })

    it('renders with errors if the API returns a 409 Conflict status', async () => {
      const requestHandler = extensionsController.create()

      const departure = departureFactory.build()
      const newDeparture = newDepartureFactory.build({
        ...departure,
      })

      request.params = {
        premisesId,
        roomId,
        bookingId,
      }
      request.body = {
        ...newDeparture,
        ...DateFormats.convertIsoToDateAndTimeInputs(newDeparture.dateTime, 'newDepartureDate'),
      }

      const err = { status: 409 }
      extensionService.createExtension.mockImplementation(() => {
        throw err
      })

      await requestHandler(request, response, next)

      expect(insertGenericError).toHaveBeenCalledWith(err, 'newDepartureDate', 'conflict')
      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        err,
        paths.bookings.extensions.new({ premisesId, roomId, bookingId }),
      )
    })
  })
})
