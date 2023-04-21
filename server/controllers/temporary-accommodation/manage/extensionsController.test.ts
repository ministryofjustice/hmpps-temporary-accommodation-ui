import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import { BespokeError } from '../../../@types/ui'
import { CallConfig } from '../../../data/restClient'
import paths from '../../../paths/temporary-accommodation/manage'
import { BedspaceService, BookingService, ExtensionService, PremisesService } from '../../../services'
import {
  bookingFactory,
  departureFactory,
  extensionFactory,
  newDepartureFactory,
  newExtensionFactory,
  premisesFactory,
  roomFactory,
} from '../../../testutils/factories'
import { generateConflictBespokeError, getLatestExtension } from '../../../utils/bookingUtils'
import { DateFormats } from '../../../utils/dateUtils'
import extractCallConfig from '../../../utils/restUtils'
import {
  catchValidationErrorOrPropogate,
  fetchErrorsAndUserInput,
  insertBespokeError,
  insertGenericError,
} from '../../../utils/validation'
import ExtensionsController from './extensionsController'

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

  const premisesService = createMock<PremisesService>({})
  const bedspaceService = createMock<BedspaceService>({})
  const bookingService = createMock<BookingService>({})
  const extensionService = createMock<ExtensionService>({})

  const extensionsController = new ExtensionsController(
    premisesService,
    bedspaceService,
    bookingService,
    extensionService,
  )

  beforeEach(() => {
    request = createMock<Request>()
    ;(extractCallConfig as jest.MockedFn<typeof extractCallConfig>).mockReturnValue(callConfig)
  })

  describe('new', () => {
    it('renders the form prepopulated with the current departure dates', async () => {
      const premises = premisesFactory.build()
      const room = roomFactory.build()
      const booking = bookingFactory.arrived().build()

      request.params = {
        premisesId: premises.id,
        roomId: room.id,
        bookingId: booking.id,
      }

      premisesService.getPremises.mockResolvedValue(premises)
      bedspaceService.getRoom.mockResolvedValue(room)
      bookingService.getBooking.mockResolvedValue(booking)

      const requestHandler = extensionsController.new()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({ errors: {}, errorSummary: [], userInput: {} })

      await requestHandler(request, response, next)

      expect(bookingService.getBooking).toHaveBeenCalledWith(callConfig, premises.id, booking.id)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/extensions/new', {
        premises,
        room,
        booking,
        errors: {},
        ...DateFormats.isoToDateAndTimeInputs(booking.departureDate, 'newDepartureDate'),
        errorSummary: [],
      })
    })

    it('renders the form prepopulated with the current departure dates and latest extension notes', async () => {
      const premises = premisesFactory.build()
      const room = roomFactory.build()
      const booking = bookingFactory.arrived().build({
        extensions: extensionFactory.buildList(2),
      })

      request.params = {
        premisesId: premises.id,
        roomId: room.id,
        bookingId: booking.id,
      }

      premisesService.getPremises.mockResolvedValue(premises)
      bedspaceService.getRoom.mockResolvedValue(room)
      bookingService.getBooking.mockResolvedValue(booking)
      ;(getLatestExtension as jest.MockedFunction<typeof getLatestExtension>).mockImplementation(
        bookings => bookings.extensions?.[0],
      )

      const requestHandler = extensionsController.new()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({ errors: {}, errorSummary: [], userInput: {} })

      await requestHandler(request, response, next)

      expect(premisesService.getPremises).toHaveBeenCalledWith(callConfig, premises.id)
      expect(bedspaceService.getRoom).toHaveBeenCalledWith(callConfig, premises.id, room.id)
      expect(bookingService.getBooking).toHaveBeenCalledWith(callConfig, premises.id, booking.id)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/extensions/new', {
        premises,
        room,
        booking,
        errors: {},
        ...DateFormats.isoToDateAndTimeInputs(booking.departureDate, 'newDepartureDate'),
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
        ...DateFormats.isoToDateAndTimeInputs(newExtension.newDepartureDate, 'newDepartureDate'),
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
        ...DateFormats.isoToDateAndTimeInputs(newDeparture.dateTime, 'newDepartureDate'),
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
        ...DateFormats.isoToDateAndTimeInputs(newDeparture.dateTime, 'newDepartureDate'),
      }

      const err = { status: 409 }
      extensionService.createExtension.mockImplementation(() => {
        throw err
      })
      const bespokeError: BespokeError = {
        errorTitle: 'some-bespoke-error',
        errorSummary: [],
      }
      ;(generateConflictBespokeError as jest.MockedFunction<typeof generateConflictBespokeError>).mockReturnValue(
        bespokeError,
      )

      await requestHandler(request, response, next)

      expect(generateConflictBespokeError).toHaveBeenCalledWith(err, premisesId, roomId, 'singular')
      expect(insertBespokeError).toHaveBeenCalledWith(err, bespokeError)
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
