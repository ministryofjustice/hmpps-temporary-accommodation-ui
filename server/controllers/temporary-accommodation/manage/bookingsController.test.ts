import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import { CallConfig } from '../../../data/restClient'
import paths from '../../../paths/temporary-accommodation/manage'
import { BookingService, PremisesService } from '../../../services'
import BedspaceService from '../../../services/bedspaceService'
import bookingFactory from '../../../testutils/factories/booking'
import newBookingFactory from '../../../testutils/factories/newBooking'
import premisesFactory from '../../../testutils/factories/premises'
import roomFactory from '../../../testutils/factories/room'
import { bookingActions, deriveBookingHistory } from '../../../utils/bookingUtils'
import { DateFormats } from '../../../utils/dateUtils'
import extractCallConfig from '../../../utils/restUtils'
import {
  catchValidationErrorOrPropogate,
  fetchErrorsAndUserInput,
  insertGenericError,
  setUserInput,
} from '../../../utils/validation'
import BookingsController from './bookingsController'

jest.mock('../../../utils/bookingUtils')
jest.mock('../../../utils/restUtils')
jest.mock('../../../utils/validation')

describe('BookingsController', () => {
  const callConfig = { token: 'some-call-config-token' } as CallConfig
  const premisesId = 'premisesId'
  const roomId = 'roomId'

  let request: Request

  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const premisesService = createMock<PremisesService>({})
  const bedspaceService = createMock<BedspaceService>({})
  const bookingService = createMock<BookingService>({})

  const bookingsController = new BookingsController(premisesService, bedspaceService, bookingService)

  beforeEach(() => {
    request = createMock<Request>()
    ;(extractCallConfig as jest.MockedFn<typeof extractCallConfig>).mockReturnValue(callConfig)
  })

  describe('new', () => {
    it('renders the form', async () => {
      request.params = {
        premisesId,
        roomId,
      }

      const premises = premisesFactory.build()
      const room = roomFactory.build()

      premisesService.getPremises.mockResolvedValue(premises)
      bedspaceService.getRoom.mockResolvedValue(room)

      const requestHandler = bookingsController.new()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({ errors: {}, errorSummary: [], userInput: {} })

      await requestHandler(request, response, next)

      expect(premisesService.getPremises).toHaveBeenCalledWith(callConfig, premisesId)
      expect(bedspaceService.getRoom).toHaveBeenCalledWith(callConfig, premisesId, roomId)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/bookings/new', {
        premises,
        room,
        errors: {},
        errorSummary: [],
      })
    })
  })

  describe('confirm', () => {
    it('renders the confirmation page', async () => {
      const newBooking = newBookingFactory.build()
      const premises = premisesFactory.build()
      const room = roomFactory.build()

      request.params = {
        premisesId,
        roomId,
      }
      request.body = {
        ...newBooking,
        ...DateFormats.convertIsoToDateAndTimeInputs(newBooking.arrivalDate, 'arrivalDate'),
        ...DateFormats.convertIsoToDateAndTimeInputs(newBooking.departureDate, 'departureDate'),
      }

      premisesService.getPremises.mockResolvedValue(premises)
      bedspaceService.getRoom.mockResolvedValue(room)

      const requestHandler = bookingsController.confirm()

      await requestHandler(request, response, next)

      expect(premisesService.getPremises).toHaveBeenCalledWith(callConfig, premisesId)
      expect(bedspaceService.getRoom).toHaveBeenCalledWith(callConfig, premisesId, roomId)
      expect(setUserInput).toHaveBeenCalledWith(request)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/bookings/confirm', {
        premises,
        room,
        crn: newBooking.crn,
        arrivalDate: newBooking.arrivalDate,
        departureDate: newBooking.departureDate,
      })
    })
  })

  describe('create', () => {
    it('creates a booking and redirects to the show room page', async () => {
      const requestHandler = bookingsController.create()

      const room = roomFactory.build()

      const booking = bookingFactory.build()
      const newBooking = newBookingFactory.build({
        ...booking,
      })

      request.params = {
        premisesId,
        roomId,
      }
      request.body = {
        ...newBooking,
        ...DateFormats.convertIsoToDateAndTimeInputs(newBooking.arrivalDate, 'arrivalDate'),
        ...DateFormats.convertIsoToDateAndTimeInputs(newBooking.departureDate, 'departureDate'),
      }

      bedspaceService.getRoom.mockResolvedValue(room)
      bookingService.createForBedspace.mockResolvedValue(booking)

      await requestHandler(request, response, next)

      expect(bookingService.createForBedspace).toHaveBeenCalledWith(
        callConfig,
        premisesId,
        room,
        expect.objectContaining(newBooking),
      )

      expect(request.flash).toHaveBeenCalledWith('success', 'Booking created')
      expect(response.redirect).toHaveBeenCalledWith(paths.bookings.show({ premisesId, roomId, bookingId: booking.id }))
    })

    it('renders with errors if the API returns an error', async () => {
      const requestHandler = bookingsController.create()

      const room = roomFactory.build()
      bedspaceService.getRoom.mockResolvedValue(room)

      const err = new Error()
      bookingService.createForBedspace.mockImplementation(() => {
        throw err
      })

      const booking = bookingFactory.build()
      const newBooking = newBookingFactory.build({
        ...booking,
      })

      request.params = {
        premisesId,
        roomId,
      }
      request.body = {
        ...newBooking,
        ...DateFormats.convertIsoToDateAndTimeInputs(newBooking.arrivalDate, 'arrivalDate'),
        ...DateFormats.convertIsoToDateAndTimeInputs(newBooking.arrivalDate, 'departureDate'),
      }

      await requestHandler(request, response, next)

      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        err,
        paths.bookings.new({ premisesId, roomId }),
      )
    })

    it('renders with errors if the API returns a 409 Conflict status', async () => {
      const requestHandler = bookingsController.create()

      const room = roomFactory.build()
      bedspaceService.getRoom.mockResolvedValue(room)

      const err = { status: 409 }
      bookingService.createForBedspace.mockImplementation(() => {
        throw err
      })

      const booking = bookingFactory.build()
      const newBooking = newBookingFactory.build({
        ...booking,
      })

      request.params = {
        premisesId,
        roomId,
      }
      request.body = {
        ...newBooking,
        ...DateFormats.convertIsoToDateAndTimeInputs(newBooking.arrivalDate, 'arrivalDate'),
        ...DateFormats.convertIsoToDateAndTimeInputs(newBooking.arrivalDate, 'departureDate'),
      }

      await requestHandler(request, response, next)

      expect(insertGenericError).toHaveBeenCalledWith(err, 'arrivalDate', 'conflict')
      expect(insertGenericError).toHaveBeenCalledWith(err, 'departureDate', 'conflict')
      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        err,
        paths.bookings.new({ premisesId, roomId }),
      )
    })
  })

  describe('show', () => {
    it('renders the template for viewing a booking', async () => {
      const premises = premisesFactory.build()
      const room = roomFactory.build()
      const booking = bookingFactory.build()

      premisesService.getPremises.mockResolvedValue(premises)
      bedspaceService.getRoom.mockResolvedValue(room)
      bookingService.getBooking.mockResolvedValue(booking)
      ;(bookingActions as jest.MockedFunction<typeof bookingActions>).mockReturnValue([])

      request.params = {
        premisesId: premises.id,
        roomId: room.id,
        bookingId: booking.id,
      }

      const requestHandler = bookingsController.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/bookings/show', {
        premises,
        room,
        booking,
        actions: [],
      })

      expect(premisesService.getPremises).toHaveBeenCalledWith(callConfig, premises.id)
      expect(bedspaceService.getRoom).toHaveBeenCalledWith(callConfig, premises.id, room.id)
      expect(bookingService.getBooking).toHaveBeenCalledWith(callConfig, premises.id, booking.id)
    })
  })

  describe('history', () => {
    it('renders the template for viewing booking history', async () => {
      const premises = premisesFactory.build()
      const room = roomFactory.build()
      const booking = bookingFactory.build()

      premisesService.getPremises.mockResolvedValue(premises)
      bedspaceService.getRoom.mockResolvedValue(room)
      bookingService.getBooking.mockResolvedValue(booking)
      ;(deriveBookingHistory as jest.MockedFunction<typeof deriveBookingHistory>).mockReturnValue([
        {
          booking,
          updatedAt: '2022-02-01',
        },
      ])

      request.params = {
        premisesId: premises.id,
        roomId: room.id,
        bookingId: booking.id,
      }

      const requestHandler = bookingsController.history()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/bookings/history', {
        premises,
        room,
        booking,
        history: [
          {
            booking,
            updatedAt: '1 Feb 22',
          },
        ],
      })

      expect(premisesService.getPremises).toHaveBeenCalledWith(callConfig, premises.id)
      expect(bedspaceService.getRoom).toHaveBeenCalledWith(callConfig, premises.id, room.id)
      expect(bookingService.getBooking).toHaveBeenCalledWith(callConfig, premises.id, booking.id)
      expect(deriveBookingHistory).toHaveBeenCalledWith(booking)
    })
  })
})
