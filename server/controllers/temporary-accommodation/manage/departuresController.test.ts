import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import { format as urlFormat } from 'url'
import { addDays } from 'date-fns'
import { CallConfig } from '../../../data/restClient'
import paths from '../../../paths/temporary-accommodation/manage'
import { BookingService, DepartureService, PremisesService } from '../../../services'
import {
  cas3BedspaceFactory,
  cas3BookingFactory,
  cas3DepartureFactory,
  cas3NewDepartureFactory,
  cas3PremisesFactory,
} from '../../../testutils/factories'
import { DateFormats } from '../../../utils/dateUtils'
import extractCallConfig from '../../../utils/restUtils'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../../utils/validation'
import DeparturesController from './departuresController'
import config from '../../../config'
import BedspaceService from '../../../services/bedspaceService'

jest.mock('../../../utils/validation')
jest.mock('../../../utils/restUtils')

describe('DeparturesController', () => {
  const callConfig = { token: 'some-call-config-token' } as CallConfig
  const premisesId = 'premisesId'
  const bedspaceId = 'bedspaceId'
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
      const premises = cas3PremisesFactory.build()
      const bedspace = cas3BedspaceFactory.build()
      const booking = cas3BookingFactory.build()

      request.params = {
        premisesId: premises.id,
        bedspaceId: bedspace.id,
        bookingId: booking.id,
      }

      premisesService.getSinglePremises.mockResolvedValue(premises)
      bedspaceService.getSingleBedspace.mockResolvedValue(bedspace)
      bookingService.getBooking.mockResolvedValue(booking)

      departureService.getReferenceData.mockResolvedValue({ departureReasons: [], moveOnCategories: [] })

      const requestHandler = departuresController.new()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({ errors: {}, errorSummary: [], userInput: {} })

      await requestHandler(request, response, next)

      expect(premisesService.getSinglePremises).toHaveBeenCalledWith(callConfig, premises.id)
      expect(bedspaceService.getSingleBedspace).toHaveBeenCalledWith(callConfig, premises.id, bedspace.id)
      expect(bookingService.getBooking).toHaveBeenCalledWith(callConfig, premises.id, booking.id)

      expect(departureService.getReferenceData).toHaveBeenCalledWith(callConfig)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/departures/new', {
        premises,
        bedspace,
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
    afterEach(() => {
      config.flags.bookingOverstayEnabled = false
    })

    it('creates a departure and redirects to the show booking page', async () => {
      const requestHandler = departuresController.create()

      const departure = cas3DepartureFactory.build()
      const newDeparture = cas3NewDepartureFactory.build({
        ...departure,
      })

      request.params = {
        premisesId,
        bedspaceId,
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
      expect(response.redirect).toHaveBeenCalledWith(paths.bookings.show({ premisesId, bedspaceId, bookingId }))
    })

    it('redirects to the overstay page when the departure puts the stay over 84 nights', async () => {
      config.flags.bookingOverstayEnabled = true

      const ninetyDaysAgo = addDays(new Date(), -90)
      const yesterday = addDays(new Date(), -1)
      const newDepartureDate = DateFormats.dateObjToIsoDate(yesterday)

      const booking = cas3BookingFactory.build({ arrivalDate: DateFormats.dateObjToIsoDate(ninetyDaysAgo) })

      const departure = cas3DepartureFactory.build({ dateTime: DateFormats.dateObjToIsoDateTime(yesterday) })
      const newDeparture = cas3NewDepartureFactory.build({ ...departure })

      request.params = {
        premisesId,
        bedspaceId,
        bookingId,
      }
      request.body = {
        ...newDeparture,
        ...DateFormats.isoToDateAndTimeInputs(newDeparture.dateTime, 'dateTime'),
      }

      bookingService.getBooking.mockResolvedValue(booking)

      const requestHandler = departuresController.create()

      await requestHandler(request, response, next)

      const address = urlFormat({
        pathname: paths.bookings.overstays.new({ premisesId, bedspaceId, bookingId }),
        query: { newDepartureDate },
      })

      expect(bookingService.getBooking).toHaveBeenCalledWith(callConfig, premisesId, bookingId)
      expect(response.redirect).toHaveBeenCalledWith(address)
      expect(request.session.departure).toEqual(expect.objectContaining(newDeparture))
      expect(request.session.previousPage).toEqual(paths.bookings.departures.new({ premisesId, bedspaceId, bookingId }))
    })

    it('renders with errors if the API returns an error', async () => {
      const requestHandler = departuresController.create()

      const departure = cas3DepartureFactory.build()
      const newDeparture = cas3NewDepartureFactory.build({
        ...departure,
      })

      request.params = {
        premisesId,
        bedspaceId,
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
        paths.bookings.departures.new({ premisesId, bedspaceId, bookingId }),
      )
    })

    it('renders with errors if the departure date is missing', async () => {
      const requestHandler = departuresController.create()

      const newDeparture = cas3NewDepartureFactory.build({ dateTime: undefined })

      request.params = { premisesId, bedspaceId, bookingId }
      request.body = { ...newDeparture }

      await requestHandler(request, response, next)

      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        expect.any(Error),
        paths.bookings.departures.new({ premisesId, bedspaceId, bookingId }),
      )
    })

    it('renders with errors if the departure reason is missing', async () => {
      const requestHandler = departuresController.create()

      const newDeparture = cas3NewDepartureFactory.build({ reasonId: undefined })

      request.params = { premisesId, bedspaceId, bookingId }
      request.body = { ...newDeparture }

      await requestHandler(request, response, next)

      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        expect.any(Error),
        paths.bookings.departures.new({ premisesId, bedspaceId, bookingId }),
      )
    })

    it('renders with errors if the move on category is missing', async () => {
      const requestHandler = departuresController.create()

      const newDeparture = cas3NewDepartureFactory.build({ moveOnCategoryId: undefined })

      request.params = { premisesId, bedspaceId, bookingId }
      request.body = { ...newDeparture }

      await requestHandler(request, response, next)

      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        expect.any(Error),
        paths.bookings.departures.new({ premisesId, bedspaceId, bookingId }),
      )
    })

    it('renders with errors if the departure date is incorrectly formatted', async () => {
      const requestHandler = departuresController.create()

      const newDeparture = cas3NewDepartureFactory.build({})

      request.params = { premisesId, bedspaceId, bookingId }
      const dateParts = DateFormats.isoToDateAndTimeInputs(newDeparture.dateTime, 'dateTime')
      request.body = {
        ...newDeparture,
        'dateTime-day': dateParts['dateTime-day'],
        'dateTime-month': '',
        'dateTime-year': dateParts['dateTime-year'],
      }

      await requestHandler(request, response, next)

      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        expect.any(Error),
        paths.bookings.departures.new({ premisesId, bedspaceId, bookingId }),
      )
    })

    it('renders with errors if the departure date is in the future', async () => {
      const requestHandler = departuresController.create()

      const departure = cas3DepartureFactory.build()
      const newDeparture = cas3NewDepartureFactory.build({
        ...departure,
        dateTime: DateFormats.dateObjToIsoDate(new Date(Date.now() + 24 * 60 * 60 * 1000)),
      })

      request.params = {
        premisesId,
        bedspaceId,
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
        paths.bookings.departures.new({ premisesId, bedspaceId, bookingId }),
      )
    })
  })

  describe('edit', () => {
    it('renders the form', async () => {
      const premises = cas3PremisesFactory.build()
      const bedspace = cas3BedspaceFactory.build()
      const booking = cas3BookingFactory.build()

      request.params = {
        premisesId: premises.id,
        bedspaceId: bedspace.id,
        bookingId: booking.id,
      }

      premisesService.getSinglePremises.mockResolvedValue(premises)
      bedspaceService.getSingleBedspace.mockResolvedValue(bedspace)
      bookingService.getBooking.mockResolvedValue(booking)

      departureService.getReferenceData.mockResolvedValue({ departureReasons: [], moveOnCategories: [] })

      const requestHandler = departuresController.edit()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({ errors: {}, errorSummary: [], userInput: {} })

      await requestHandler(request, response, next)

      expect(premisesService.getSinglePremises).toHaveBeenCalledWith(callConfig, premises.id)
      expect(bedspaceService.getSingleBedspace).toHaveBeenCalledWith(callConfig, premises.id, bedspace.id)
      expect(bookingService.getBooking).toHaveBeenCalledWith(callConfig, premises.id, booking.id)

      expect(departureService.getReferenceData).toHaveBeenCalledWith(callConfig)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/departures/edit', {
        premises,
        bedspace,
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

      const departure = cas3DepartureFactory.build()
      const newDeparture = cas3NewDepartureFactory.build({
        ...departure,
      })

      request.params = {
        premisesId,
        bedspaceId,
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
      expect(response.redirect).toHaveBeenCalledWith(paths.bookings.show({ premisesId, bedspaceId, bookingId }))
    })

    it('redirects to the overstay page when the departure puts the stay over 84 nights', async () => {
      config.flags.bookingOverstayEnabled = true

      const ninetyDaysAgo = addDays(new Date(), -90)
      const yesterday = addDays(new Date(), -1)
      const newDepartureDate = DateFormats.dateObjToIsoDate(yesterday)

      const booking = cas3BookingFactory.build({ arrivalDate: DateFormats.dateObjToIsoDate(ninetyDaysAgo) })

      const departure = cas3DepartureFactory.build({ dateTime: DateFormats.dateObjToIsoDateTime(yesterday) })
      const newDeparture = cas3NewDepartureFactory.build({ ...departure })

      request.params = {
        premisesId,
        bedspaceId,
        bookingId,
      }
      request.body = {
        ...newDeparture,
        ...DateFormats.isoToDateAndTimeInputs(newDeparture.dateTime, 'dateTime'),
      }

      bookingService.getBooking.mockResolvedValue(booking)

      const requestHandler = departuresController.update()

      await requestHandler(request, response, next)

      const address = urlFormat({
        pathname: paths.bookings.overstays.new({ premisesId, bedspaceId, bookingId }),
        query: { newDepartureDate },
      })

      expect(bookingService.getBooking).toHaveBeenCalledWith(callConfig, premisesId, bookingId)
      expect(response.redirect).toHaveBeenCalledWith(address)
      expect(request.session.departure).toEqual(expect.objectContaining(newDeparture))
      expect(request.session.previousPage).toEqual(
        paths.bookings.departures.edit({ premisesId, bedspaceId, bookingId }),
      )
    })

    it('renders with errors if the API returns an error', async () => {
      const requestHandler = departuresController.update()

      const departure = cas3DepartureFactory.build()
      const newDeparture = cas3NewDepartureFactory.build({
        ...departure,
      })

      request.params = {
        premisesId,
        bedspaceId,
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
        paths.bookings.departures.edit({ premisesId, bedspaceId, bookingId }),
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
      const premises = cas3PremisesFactory.build()
      const bedspace = cas3BedspaceFactory.build()
      const booking = cas3BookingFactory.build()

      request.params = {
        premisesId: premises.id,
        bedspaceId: bedspace.id,
        bookingId: booking.id,
      }

      premisesService.getSinglePremises.mockResolvedValue(premises)
      bedspaceService.getSingleBedspace.mockResolvedValue(bedspace)
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

      const departure = cas3DepartureFactory.build()
      const newDeparture = cas3NewDepartureFactory.build({
        ...departure,
      })

      request.params = {
        premisesId,
        bedspaceId,
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
