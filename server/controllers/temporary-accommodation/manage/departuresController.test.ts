import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import { CallConfig } from '../../../data/restClient'
import paths from '../../../paths/temporary-accommodation/manage'
import { BedspaceService, BookingService, DepartureService, PremisesService } from '../../../services'
import {
  bookingFactory,
  departureFactory,
  newDepartureFactory,
  premisesFactory,
  roomFactory,
} from '../../../testutils/factories'
import { DateFormats } from '../../../utils/dateUtils'
import extractCallConfig from '../../../utils/restUtils'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../../utils/validation'
import DeparturesController from './departuresController'
import config from '../../../config'

jest.mock('../../../utils/validation')
jest.mock('../../../utils/restUtils')

describe('DeparturesController', () => {
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
  const departureService = createMock<DepartureService>({})

  const departuresController = new DeparturesController(
    premisesService,
    bedspaceService,
    bookingService,
    departureService,
  )

  beforeEach(() => {
    request = createMock<Request>()
    ;(extractCallConfig as jest.MockedFn<typeof extractCallConfig>).mockReturnValue(callConfig)
  })

  describe('new', () => {
    it('renders the form', async () => {
      const premises = premisesFactory.build()
      const room = roomFactory.build()
      const booking = bookingFactory.build()

      request.params = {
        premisesId: premises.id,
        roomId: room.id,
        bookingId: booking.id,
      }

      premisesService.getPremises.mockResolvedValue(premises)
      bedspaceService.getRoom.mockResolvedValue(room)
      bookingService.getBooking.mockResolvedValue(booking)

      departureService.getReferenceData.mockResolvedValue({ departureReasons: [], moveOnCategories: [] })

      const requestHandler = departuresController.new()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({ errors: {}, errorSummary: [], userInput: {} })

      await requestHandler(request, response, next)

      expect(premisesService.getPremises).toHaveBeenCalledWith(callConfig, premises.id)
      expect(bedspaceService.getRoom).toHaveBeenCalledWith(callConfig, premises.id, room.id)
      expect(bookingService.getBooking).toHaveBeenCalledWith(callConfig, premises.id, booking.id)

      expect(departureService.getReferenceData).toHaveBeenCalledWith(callConfig)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/departures/new', {
        premises,
        room,
        booking,
        allDepartureReasons: [],
        allMoveOnCategories: [],
        errors: {},
        errorSummary: [],
        nDeliusUpdateMessage: true,
      })
    })
  })

  describe('create', () => {
    it('creates a departure and redirects to the show booking page', async () => {
      const requestHandler = departuresController.create()

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
        ...DateFormats.isoToDateAndTimeInputs(newDeparture.dateTime, 'dateTime'),
      }

      departureService.createDeparture.mockResolvedValue(departure)

      await requestHandler(request, response, next)

      expect(departureService.createDeparture).toHaveBeenCalledWith(
        callConfig,
        premisesId,
        bookingId,
        expect.objectContaining(newDeparture),
      )

      expect(request.flash).toHaveBeenCalledWith('success', {
        title: 'Booking marked as departed',
        text: 'At the moment the CAS3 digital service does not automatically update NDelius. Please continue to record accommodation and address changes directly in NDelius.',
      })
      expect(response.redirect).toHaveBeenCalledWith(paths.bookings.show({ premisesId, roomId, bookingId }))
    })

    it('renders with errors if the API returns an error', async () => {
      const requestHandler = departuresController.create()

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
        ...DateFormats.isoToDateAndTimeInputs(newDeparture.dateTime, 'dateTime'),
      }

      const err = new Error()
      departureService.createDeparture.mockImplementation(() => {
        throw err
      })

      await requestHandler(request, response, next)

      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        err,
        paths.bookings.departures.new({ premisesId, roomId, bookingId }),
      )
    })

    it('renders with errors if the departure date is in the future', async () => {
      const requestHandler = departuresController.create()
    
      const departure = departureFactory.build()
      const newDeparture = newDepartureFactory.build({
        ...departure,
        dateTime: DateFormats.dateObjToIsoDate(new Date(Date.now() + 24 * 60 * 60 * 1000)),
      })
    
      request.params = {
        premisesId,
        roomId,
        bookingId,
      }
      request.body = {
        ...newDeparture,
        ...DateFormats.isoToDateAndTimeInputs(newDeparture.dateTime, 'dateTime'),
      }
    
      await requestHandler(request, response, next)
    
      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        expect.any(Error),
        paths.bookings.departures.new({ premisesId, roomId, bookingId }),
      )
    })
  })

  describe('edit', () => {
    it('renders the form', async () => {
      const premises = premisesFactory.build()
      const room = roomFactory.build()
      const booking = bookingFactory.build()

      request.params = {
        premisesId: premises.id,
        roomId: room.id,
        bookingId: booking.id,
      }

      premisesService.getPremises.mockResolvedValue(premises)
      bedspaceService.getRoom.mockResolvedValue(room)
      bookingService.getBooking.mockResolvedValue(booking)

      departureService.getReferenceData.mockResolvedValue({ departureReasons: [], moveOnCategories: [] })

      const requestHandler = departuresController.edit()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({ errors: {}, errorSummary: [], userInput: {} })

      await requestHandler(request, response, next)

      expect(premisesService.getPremises).toHaveBeenCalledWith(callConfig, premises.id)
      expect(bedspaceService.getRoom).toHaveBeenCalledWith(callConfig, premises.id, room.id)
      expect(bookingService.getBooking).toHaveBeenCalledWith(callConfig, premises.id, booking.id)

      expect(departureService.getReferenceData).toHaveBeenCalledWith(callConfig)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/departures/edit', {
        premises,
        room,
        booking,
        allDepartureReasons: [],
        allMoveOnCategories: [],
        errors: {},
        errorSummary: [],
        ...DateFormats.isoToDateAndTimeInputs(booking.departure.dateTime, 'dateTime'),
        reasonId: booking.departure.reason.id,
        moveOnCategoryId: booking.departure.moveOnCategory.id,
        notes: booking.departure.notes,
      })
    })
  })

  describe('update', () => {
    it('creates a new departure and redirects to the show booking page', async () => {
      const requestHandler = departuresController.update()

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
        ...DateFormats.isoToDateAndTimeInputs(newDeparture.dateTime, 'dateTime'),
      }

      departureService.createDeparture.mockResolvedValue(departure)

      await requestHandler(request, response, next)

      expect(departureService.createDeparture).toHaveBeenCalledWith(
        callConfig,
        premisesId,
        bookingId,
        expect.objectContaining(newDeparture),
      )

      expect(request.flash).toHaveBeenCalledWith('success', 'Departure details changed')
      expect(response.redirect).toHaveBeenCalledWith(paths.bookings.show({ premisesId, roomId, bookingId }))
    })

    it('renders with errors if the API returns an error', async () => {
      const requestHandler = departuresController.update()

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
        ...DateFormats.isoToDateAndTimeInputs(newDeparture.dateTime, 'dateTime'),
      }

      const err = new Error()
      departureService.createDeparture.mockImplementation(() => {
        throw err
      })

      await requestHandler(request, response, next)

      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        err,
        paths.bookings.departures.edit({ premisesId, roomId, bookingId }),
      )
    })
  })

  describe('if the domainEvent feature flag contains personDeparted', () => {
    beforeEach(() => {
      jest.mock('../../../config')
      config.flags.domainEventsEmit = 'personDeparted'
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    it('does not show the NDelius update message when creating', async () => {
      const premises = premisesFactory.build()
      const room = roomFactory.build()
      const booking = bookingFactory.build()

      request.params = {
        premisesId: premises.id,
        roomId: room.id,
        bookingId: booking.id,
      }

      premisesService.getPremises.mockResolvedValue(premises)
      bedspaceService.getRoom.mockResolvedValue(room)
      bookingService.getBooking.mockResolvedValue(booking)

      departureService.getReferenceData.mockResolvedValue({ departureReasons: [], moveOnCategories: [] })

      const requestHandler = departuresController.new()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({ errors: {}, errorSummary: [], userInput: {} })

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith(
        'temporary-accommodation/departures/new',
        expect.objectContaining({
          nDeliusUpdateMessage: false,
        }),
      )
    })

    it('renders a different success message after creating', async () => {
      const requestHandler = departuresController.create()

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
        ...DateFormats.isoToDateAndTimeInputs(newDeparture.dateTime, 'dateTime'),
      }

      departureService.createDeparture.mockResolvedValue(departure)

      await requestHandler(request, response, next)

      expect(request.flash).toHaveBeenCalledWith('success', {
        title: 'Booking marked as departed',
        text: 'You no longer need to update NDelius with this change.',
      })
    })
  })
})
