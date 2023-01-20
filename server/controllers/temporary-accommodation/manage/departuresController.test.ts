import type { Response, NextFunction } from 'express'
import { createMock, DeepMocked } from '@golevelup/ts-jest'
import paths from '../../../paths/temporary-accommodation/manage'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../../utils/validation'
import bookingFactory from '../../../testutils/factories/booking'
import { BookingService, DepartureService } from '../../../services'
import departureFactory from '../../../testutils/factories/departure'
import newDepartureFactory from '../../../testutils/factories/newDeparture'
import { DateFormats } from '../../../utils/dateUtils'
import DeparturesController from './departuresController'
import { createMockRequest, MockRequest } from '../../../testutils/createMockRequest'

jest.mock('../../../utils/validation')

describe('DeparturesController', () => {
  const premisesId = 'premisesId'
  const roomId = 'roomId'
  const bookingId = 'bookingId'

  let request: MockRequest

  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const bookingService = createMock<BookingService>({})
  const departureService = createMock<DepartureService>({})

  const departuresController = new DeparturesController(bookingService, departureService)

  beforeEach(() => {
    request = createMockRequest()
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

      expect(bookingService.getBooking).toHaveBeenCalledWith(request, premisesId, booking.id)
      expect(departureService.getReferenceData).toHaveBeenCalledWith(request)

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
        request,
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
