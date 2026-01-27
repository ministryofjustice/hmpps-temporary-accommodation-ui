import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import { format as urlFormat } from 'url'
import { CallConfig } from '../../../data/restClient'
import { BookingService, DepartureService, OverstaysService, PremisesService } from '../../../services'
import BedspaceService from '../../../services/bedspaceService'
import OverstaysController from './overstaysController'
import extractCallConfig from '../../../utils/restUtils'
import {
  cas3BedspaceFactory,
  cas3BookingFactory,
  cas3DepartureFactory,
  cas3NewDepartureFactory,
  cas3NewOverstayFactory,
  cas3OverstayFactory,
  cas3PremisesFactory,
} from '../../../testutils/factories'
import { DateFormats, nightsBetween } from '../../../utils/dateUtils'
import paths from '../../../paths/temporary-accommodation/manage'
import {
  addValidationErrorsAndRedirect,
  catchValidationErrorOrPropogate,
  fetchErrorsAndUserInput,
} from '../../../utils/validation'
import { SanitisedError } from '../../../sanitisedError'
import config from '../../../config'

jest.mock('../../../utils/validation')
jest.mock('../../../utils/restUtils')

describe('OverstaysController', () => {
  const callConfig = { token: 'some-token' } as CallConfig

  let request: Request
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const premisesService = createMock<PremisesService>({})
  const bedspaceService = createMock<BedspaceService>({})
  const bookingService = createMock<BookingService>({})
  const overstaysService = createMock<OverstaysService>({})
  const departuresService = createMock<DepartureService>()

  const overstaysController = new OverstaysController(
    premisesService,
    bedspaceService,
    bookingService,
    overstaysService,
    departuresService,
  )

  const premises = cas3PremisesFactory.build()
  const bedspace = cas3BedspaceFactory.build()
  const booking = cas3BookingFactory.build()

  beforeEach(() => {
    config.flags.bookingOverstayEnabled = true

    request = createMock<Request>()
    ;(extractCallConfig as jest.MockedFn<typeof extractCallConfig>).mockReturnValue(callConfig)

    request.params = {
      premisesId: premises.id,
      bedspaceId: bedspace.id,
      bookingId: booking.id,
    }
  })

  describe('new', () => {
    it('renders the form for creating an overstay', async () => {
      const newOverstay = cas3NewOverstayFactory.build()

      request.query = { newDepartureDate: newOverstay.newDepartureDate }

      premisesService.getSinglePremises.mockResolvedValue(premises)
      bedspaceService.getSingleBedspace.mockResolvedValue(bedspace)
      bookingService.getBooking.mockResolvedValue(booking)

      const requestHandler = overstaysController.new()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({ errors: {}, errorSummary: [], userInput: {} })

      await requestHandler(request, response, next)

      expect(premisesService.getSinglePremises).toHaveBeenCalledWith(callConfig, premises.id)
      expect(bedspaceService.getSingleBedspace)
      expect(bookingService.getBooking).toHaveBeenCalledWith(callConfig, premises.id, booking.id)

      const expectedNightsOverLimit = nightsBetween(booking.arrivalDate, newOverstay.newDepartureDate) - 84
      const expectedTitle = `The new departure date means the booking is ${expectedNightsOverLimit} night${expectedNightsOverLimit === 1 ? '' : 's'} over the limit`
      const expectedQuestion = 'Is this an authorised overstay?'

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/overstays/new', {
        premises,
        bedspace,
        booking,
        newDepartureDate: newOverstay.newDepartureDate,
        nightsOverLimit: expectedNightsOverLimit,
        title: expectedTitle,
        question: expectedQuestion,
        errorSummary: [],
        errors: {},
      })
    })

    it('renders the form for creating an overstayed departure', async () => {
      const newOverstay = cas3NewOverstayFactory.build()
      const newDeparture = cas3NewDepartureFactory.build({
        dateTime: DateFormats.dateObjToIsoDateTime(DateFormats.isoToDateObj(newOverstay.newDepartureDate)),
      })

      request.query = { newDepartureDate: newOverstay.newDepartureDate }
      request.session.departure = newDeparture

      premisesService.getSinglePremises.mockResolvedValue(premises)
      bedspaceService.getSingleBedspace.mockResolvedValue(bedspace)
      bookingService.getBooking.mockResolvedValue(booking)

      const requestHandler = overstaysController.new()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({ errors: {}, errorSummary: [], userInput: {} })

      await requestHandler(request, response, next)

      expect(premisesService.getSinglePremises).toHaveBeenCalledWith(callConfig, premises.id)
      expect(bedspaceService.getSingleBedspace).toHaveBeenCalledWith(callConfig, premises.id, bedspace.id)
      expect(bookingService.getBooking).toHaveBeenCalledWith(callConfig, premises.id, booking.id)

      const expectedNightsOverLimit = nightsBetween(booking.arrivalDate, newOverstay.newDepartureDate) - 84
      const expectedTitle = `The departure date means the booking was overstayed by ${expectedNightsOverLimit} night${expectedNightsOverLimit === 1 ? '' : 's'}`
      const expectedQuestion = 'Was this an authorised overstay?'

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/overstays/new', {
        premises,
        bedspace,
        booking,
        newDepartureDate: newOverstay.newDepartureDate,
        nightsOverLimit: expectedNightsOverLimit,
        title: expectedTitle,
        question: expectedQuestion,
        errorSummary: [],
        errors: {},
      })
    })

    it('redirects to the new extension page when the booking overstay feature flag is disabled', async () => {
      config.flags.bookingOverstayEnabled = false

      const newOverstay = cas3NewOverstayFactory.build()
      request.query = { newDepartureDate: newOverstay.newDepartureDate }

      const requestHandler = overstaysController.new()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({ errors: {}, errorSummary: [], userInput: {} })

      await requestHandler(request, response, next)

      expect(response.redirect).toHaveBeenCalledWith(
        paths.bookings.extensions.new({ premisesId: premises.id, bedspaceId: bedspace.id, bookingId: booking.id }),
      )
    })
  })

  describe('create', () => {
    it('creates an overstay and redirects to the show booking page', async () => {
      const requestHandler = overstaysController.create()

      const overstay = cas3OverstayFactory.build()
      const newOverstay = cas3NewOverstayFactory.build({
        newDepartureDate: overstay.newDepartureDate,
        isAuthorised: overstay.isAuthorised,
        reason: overstay.reason,
      })

      request.body = {
        newDepartureDate: newOverstay.newDepartureDate,
        reason: newOverstay.reason,
        isAuthorised: newOverstay.isAuthorised ? 'yes' : 'no',
      }

      overstaysService.createOverstay.mockResolvedValue(overstay)

      await requestHandler(request, response, next)

      expect(overstaysService.createOverstay).toHaveBeenCalledWith(callConfig, premises.id, booking.id, newOverstay)

      expect(request.flash).toHaveBeenCalledWith('success', 'Booking departure date changed')
      expect(response.redirect).toHaveBeenCalledWith(
        paths.bookings.show({ premisesId: premises.id, bedspaceId: bedspace.id, bookingId: booking.id }),
      )
    })

    it('creates an overstay and marks a booking as departed before redirecting to the booking page', async () => {
      const departure = cas3DepartureFactory.build()
      const newDeparture = cas3NewDepartureFactory.build({ ...departure })
      const newOverstay = cas3NewOverstayFactory.build({
        newDepartureDate: DateFormats.dateObjToIsoDate(DateFormats.isoToDateObj(newDeparture.dateTime)),
      })
      const overstay = cas3OverstayFactory.build({ ...newOverstay })

      request.session.departure = newDeparture

      request.body = {
        newDepartureDate: newOverstay.newDepartureDate,
        reason: newOverstay.reason,
        isAuthorised: newOverstay.isAuthorised ? 'yes' : 'no',
      }

      overstaysService.createOverstay.mockResolvedValue(overstay)
      departuresService.createDeparture.mockResolvedValue(departure)

      const requestHandler = overstaysController.create()

      await requestHandler(request, response, next)

      expect(overstaysService.createOverstay).toHaveBeenCalledWith(callConfig, premises.id, booking.id, newOverstay)
      expect(departuresService.createDeparture).toHaveBeenCalledWith(callConfig, premises.id, booking.id, newDeparture)

      expect(request.flash).toHaveBeenCalledWith('success', 'Booking marked as departed')
      expect(response.redirect).toHaveBeenCalledWith(
        paths.bookings.show({ premisesId: premises.id, bedspaceId: bedspace.id, bookingId: booking.id }),
      )
    })

    it('redirects to the booking extension page with errors if the overstay API endpoint returns a 409 error', async () => {
      const requestHandler = overstaysController.create()

      const overstay = cas3NewOverstayFactory.build()

      request.body = { ...overstay }

      const err: SanitisedError = {
        stack: '',
        message: 'error',
        status: 409,
        data: { detail: 'error' },
      }
      overstaysService.createOverstay.mockImplementation(() => {
        throw err
      })

      await requestHandler(request, response, next)

      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        err,
        paths.bookings.extensions.new({ premisesId: premises.id, bedspaceId: bedspace.id, bookingId: booking.id }),
      )
    })

    it('redirects to the new overstays page with errors if the overstay API returns any other error', async () => {
      const requestHandler = overstaysController.create()

      const overstay = cas3NewOverstayFactory.build()

      request.body = { ...overstay }

      const err = new Error()
      overstaysService.createOverstay.mockImplementation(() => {
        throw err
      })

      const expectedUrl = urlFormat({
        pathname: paths.bookings.overstays.new({
          premisesId: premises.id,
          bedspaceId: bedspace.id,
          bookingId: booking.id,
        }),
        query: { newDepartureDate: overstay.newDepartureDate },
      })

      await requestHandler(request, response, next)

      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(request, response, err, expectedUrl)
    })

    it('redirects to the departure page with errors if the departure API returns an error', async () => {
      const departure = cas3DepartureFactory.build()
      const newDeparture = cas3NewDepartureFactory.build({ ...departure })
      const newOverstay = cas3NewOverstayFactory.build({
        newDepartureDate: DateFormats.dateObjToIsoDate(DateFormats.isoToDateObj(newDeparture.dateTime)),
      })
      const overstay = cas3OverstayFactory.build({ ...newOverstay })

      request.session.departure = newDeparture

      request.body = {
        newDepartureDate: newOverstay.newDepartureDate,
        reason: newOverstay.reason,
        isAuthorised: newOverstay.isAuthorised ? 'yes' : 'no',
      }

      overstaysService.createOverstay.mockResolvedValue(overstay)
      const err = new Error()
      departuresService.createDeparture.mockImplementation(() => {
        throw err
      })

      const requestHandler = overstaysController.create()

      await requestHandler(request, response, next)

      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        err,
        paths.bookings.departures.new({ premisesId: premises.id, bedspaceId: bedspace.id, bookingId: booking.id }),
      )
    })

    it('shows an error when the user tries to submit without selecting whether the overstay is authorised', async () => {
      const requestHandler = overstaysController.create()

      const overstay = cas3NewOverstayFactory.build()
      request.body = { reason: overstay.reason, newDepartureDate: overstay.newDepartureDate }

      await requestHandler(request, response, next)

      const expectedErrors: Record<string, string> = {
        isAuthorised: 'You must confirm whether the overstay is authorised',
      }

      const expectedUrl = urlFormat({
        pathname: paths.bookings.overstays.new({
          premisesId: premises.id,
          bedspaceId: bedspace.id,
          bookingId: booking.id,
        }),
        query: { newDepartureDate: overstay.newDepartureDate },
      })

      expect(addValidationErrorsAndRedirect).toHaveBeenCalledWith(request, response, expectedErrors, expectedUrl)
    })

    it('redirects to the new extension page when the booking overstay feature flag is disabled', async () => {
      config.flags.bookingOverstayEnabled = false

      const requestHandler = overstaysController.create()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({ errors: {}, errorSummary: [], userInput: {} })

      await requestHandler(request, response, next)

      expect(response.redirect).toHaveBeenCalledWith(
        paths.bookings.extensions.new({ premisesId: premises.id, bedspaceId: bedspace.id, bookingId: booking.id }),
      )
    })
  })
})
