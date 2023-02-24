import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import { CallConfig } from '../../../data/restClient'
import paths from '../../../paths/temporary-accommodation/manage'
import { BookingService, DepartureService } from '../../../services'
import bookingFactory from '../../../testutils/factories/booking'
import departureFactory from '../../../testutils/factories/departure'
import newDepartureFactory from '../../../testutils/factories/newDeparture'
import { DateFormats } from '../../../utils/dateUtils'
import extractCallConfig from '../../../utils/restUtils'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../../utils/validation'
import DeparturesController from './departuresController'

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

  const bookingService = createMock<BookingService>({})
  const departureService = createMock<DepartureService>({})

  const departuresController = new DeparturesController(bookingService, departureService)

  beforeEach(() => {
    request = createMock<Request>()
    ;(extractCallConfig as jest.MockedFn<typeof extractCallConfig>).mockReturnValue(callConfig)
  })

  describe('new', () => {
    it('renders the form prepopulated with the current departure dates', async () => {
      const booking = bookingFactory.build()

      request.params = {
        premisesId,
        roomId,
        bookingId: booking.id,
      }

      bookingService.getBooking.mockResolvedValue(booking)
      departureService.getReferenceData.mockResolvedValue({ departureReasons: [], moveOnCategories: [] })

      const requestHandler = departuresController.new()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({ errors: {}, errorSummary: [], userInput: {} })

      await requestHandler(request, response, next)

      expect(bookingService.getBooking).toHaveBeenCalledWith(callConfig, premisesId, booking.id)
      expect(departureService.getReferenceData).toHaveBeenCalledWith(callConfig)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/departures/new', {
        booking,
        roomId,
        premisesId,
        allDepartureReasons: [],
        allMoveOnCategories: [],
        errors: {},
        ...DateFormats.convertIsoToDateAndTimeInputs(booking.departureDate, 'dateTime'),
        errorSummary: [],
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
        ...DateFormats.convertIsoToDateAndTimeInputs(newDeparture.dateTime, 'dateTime'),
      }

      departureService.createDeparture.mockResolvedValue(departure)

      await requestHandler(request, response, next)

      expect(departureService.createDeparture).toHaveBeenCalledWith(
        callConfig,
        premisesId,
        bookingId,
        expect.objectContaining(newDeparture),
      )

      expect(request.flash).toHaveBeenCalledWith('success', 'Booking marked as closed')
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
        ...DateFormats.convertIsoToDateAndTimeInputs(newDeparture.dateTime, 'dateTime'),
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
  })
})
