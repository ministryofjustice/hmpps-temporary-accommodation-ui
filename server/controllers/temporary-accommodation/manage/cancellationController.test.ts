import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import { CancellationsController } from '.'
import { CallConfig } from '../../../data/restClient'
import paths from '../../../paths/temporary-accommodation/manage'
import { BedspaceService, BookingService, CancellationService, PremisesService } from '../../../services'
import {
  bookingFactory,
  cancellationFactory,
  newCancellationFactory,
  premisesFactory,
  roomFactory,
} from '../../../testutils/factories'
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

  const premisesService = createMock<PremisesService>({})
  const bedspaceService = createMock<BedspaceService>({})
  const bookingService = createMock<BookingService>({})
  const cancellationService = createMock<CancellationService>({})

  const cancellationsController = new CancellationsController(
    premisesService,
    bedspaceService,
    bookingService,
    cancellationService,
  )

  beforeEach(() => {
    request = createMock<Request>()
    ;(extractCallConfig as jest.MockedFn<typeof extractCallConfig>).mockReturnValue(callConfig)
  })

  describe('new', () => {
    it('renders the form', async () => {
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

      cancellationService.getReferenceData.mockResolvedValue({ cancellationReasons: [] })

      const requestHandler = cancellationsController.new()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({ errors: {}, errorSummary: [], userInput: {} })

      await requestHandler(request, response, next)

      expect(premisesService.getPremises).toHaveBeenCalledWith(callConfig, premises.id)
      expect(bedspaceService.getRoom).toHaveBeenCalledWith(callConfig, premises.id, room.id)
      expect(bookingService.getBooking).toHaveBeenCalledWith(callConfig, premises.id, booking.id)

      expect(cancellationService.getReferenceData).toHaveBeenCalledWith(callConfig)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/cancellations/new', {
        premises,
        room,
        booking,
        allCancellationReasons: [],
        errors: {},
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
        ...DateFormats.isoToDateAndTimeInputs(newCancellation.date, 'date'),
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
        ...DateFormats.isoToDateAndTimeInputs(newCancellation.date, 'date'),
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

  describe('edit', () => {
    it('renders the form', async () => {
      const premises = premisesFactory.build()
      const room = roomFactory.build()
      const booking = bookingFactory.cancelled().build()

      request.params = {
        premisesId: premises.id,
        roomId: room.id,
        bookingId: booking.id,
      }

      premisesService.getPremises.mockResolvedValue(premises)
      bedspaceService.getRoom.mockResolvedValue(room)
      bookingService.getBooking.mockResolvedValue(booking)

      cancellationService.getReferenceData.mockResolvedValue({ cancellationReasons: [] })

      const requestHandler = cancellationsController.edit()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({ errors: {}, errorSummary: [], userInput: {} })

      await requestHandler(request, response, next)

      expect(premisesService.getPremises).toHaveBeenCalledWith(callConfig, premises.id)
      expect(bedspaceService.getRoom).toHaveBeenCalledWith(callConfig, premises.id, room.id)
      expect(bookingService.getBooking).toHaveBeenCalledWith(callConfig, premises.id, booking.id)

      expect(cancellationService.getReferenceData).toHaveBeenCalledWith(callConfig)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/cancellations/edit', {
        premises,
        room,
        booking,
        allCancellationReasons: [],
        errors: {},
        errorSummary: [],
        ...DateFormats.isoToDateAndTimeInputs(booking.cancellation.date, 'date'),
        reason: booking.cancellation.reason.id,
        notes: booking.cancellation.notes,
      })
    })
  })

  describe('update', () => {
    it('creates a new cancellation and redirects to the show booking page', async () => {
      const requestHandler = cancellationsController.update()

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
        ...DateFormats.isoToDateAndTimeInputs(newCancellation.date, 'date'),
      }

      cancellationService.createCancellation.mockResolvedValue(cancellation)

      await requestHandler(request, response, next)

      expect(cancellationService.createCancellation).toHaveBeenCalledWith(
        callConfig,
        premisesId,
        bookingId,
        expect.objectContaining(newCancellation),
      )

      expect(request.flash).toHaveBeenCalledWith('success', 'Cancelled booking updated')
      expect(response.redirect).toHaveBeenCalledWith(paths.bookings.show({ premisesId, roomId, bookingId }))
    })

    it('renders with errors if the API returns an error', async () => {
      const requestHandler = cancellationsController.update()

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
        ...DateFormats.isoToDateAndTimeInputs(newCancellation.date, 'date'),
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
        paths.bookings.cancellations.edit({ premisesId, roomId, bookingId }),
        'bookingCancellation',
      )
    })
  })
})
