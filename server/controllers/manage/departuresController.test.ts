import type { Request, Response, NextFunction } from 'express'
import { createMock, DeepMocked } from '@golevelup/ts-jest'
import type { ErrorsAndUserInput } from '@approved-premises/ui'

import DepartureService, { DepartureReferenceData } from '../../services/departureService'
import DeparturesController from './departuresController'
import { PremisesService } from '../../services'
import BookingService from '../../services/bookingService'
import departureFactory from '../../testutils/factories/departure'
import bookingFactory from '../../testutils/factories/booking'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../utils/validation'
import paths from '../../paths/manage'

jest.mock('../../utils/validation')

describe('DeparturesController', () => {
  const token = 'SOME_TOKEN'

  const request: DeepMocked<Request> = createMock<Request>({ user: { token } })
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const departureService = createMock<DepartureService>({})
  const premisesService = createMock<PremisesService>({})
  const bookingService = createMock<BookingService>({})

  const departuresController = new DeparturesController(departureService, premisesService, bookingService)

  describe('new', () => {
    const booking = bookingFactory.build()
    const bookingId = 'bookingId'
    const premisesId = 'premisesId'

    beforeEach(() => {
      premisesService.getPremisesSelectList.mockResolvedValue([{ value: 'id', text: 'name' }])
      bookingService.find.mockResolvedValue(booking)
    })

    it('renders the form', async () => {
      const referenceData = createMock<DepartureReferenceData>()
      departureService.getReferenceData.mockResolvedValue(referenceData)
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({ errors: {}, errorSummary: [], userInput: {} })

      const requestHandler = departuresController.new()

      request.params = {
        bookingId,
        premisesId,
      }

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('departures/new', {
        premisesId,
        booking,
        premisesSelectList: [
          {
            text: 'name',
            value: 'id',
          },
        ],
        referenceData,
        pageHeading: 'Log a departure',
        errorSummary: [],
        errors: {},
      })

      expect(premisesService.getPremisesSelectList).toHaveBeenCalledWith(token)
      expect(bookingService.find).toHaveBeenCalledWith(token, 'premisesId', 'bookingId')
      expect(departureService.getReferenceData).toHaveBeenCalledWith(token)
    })

    it('renders the form with errors', async () => {
      const referenceData = createMock<DepartureReferenceData>()
      const errorsAndUserInput = createMock<ErrorsAndUserInput>()

      departureService.getReferenceData.mockResolvedValue(referenceData)
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue(errorsAndUserInput)

      const requestHandler = departuresController.new()

      request.params = {
        bookingId,
        premisesId,
      }

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('departures/new', {
        premisesId,
        booking,
        premisesSelectList: [
          {
            text: 'name',
            value: 'id',
          },
        ],
        referenceData,
        pageHeading: 'Log a departure',
        errorSummary: errorsAndUserInput.errorSummary,
        errors: errorsAndUserInput.errors,
        ...errorsAndUserInput.userInput,
      })

      expect(premisesService.getPremisesSelectList).toHaveBeenCalledWith(token)
      expect(bookingService.find).toHaveBeenCalledWith(token, 'premisesId', 'bookingId')
    })
  })

  describe('create', () => {
    it('creates an Departure and redirects to the confirmation page', async () => {
      const departure = departureFactory.build()
      departureService.createDeparture.mockResolvedValue(departure)

      const requestHandler = departuresController.create()

      request.params = {
        bookingId: 'bookingId',
        premisesId: 'premisesId',
      }

      request.body = {
        'dateTime-year': 2022,
        'dateTime-month': 12,
        'dateTime-day': 11,
        'dateTime-time': '12:35',
        departure: {
          notes: 'Some notes',
          reason: 'Bed withdrawn',
          moveOnCategory: 'Custody',
          destinationProvider: 'London',
          destinationAp: 'Some AP',
          name: 'John Doe',
          crn: 'A123456',
        },
      }

      await requestHandler(request, response, next)

      const expectedDeparture = {
        ...request.body.departure,
        dateTime: new Date(2022, 11, 11, 12, 35).toISOString(),
      }

      expect(departureService.createDeparture).toHaveBeenCalledWith(
        token,
        request.params.premisesId,
        request.params.bookingId,
        expectedDeparture,
      )

      expect(response.redirect).toHaveBeenCalledWith(
        paths.bookings.departures.confirm({
          premisesId: request.params.premisesId,
          bookingId: request.params.bookingId,
          departureId: departure.id,
        }),
      )
    })

    it('should catch the validation errors when the API returns an error', async () => {
      const requestHandler = departuresController.create()

      const premisesId = 'premisesId'

      request.params = {
        bookingId: 'bookingId',
        premisesId,
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
        paths.bookings.departures.new({
          premisesId: request.params.premisesId,
          bookingId: request.params.bookingId,
        }),
      )
    })
  })

  describe('confirm', () => {
    it('renders the confirmation page', async () => {
      const booking = bookingFactory.build()
      bookingService.find.mockResolvedValue(booking)

      const departure = departureFactory.build()
      departureService.getDeparture.mockResolvedValue(departure)

      const premisesId = 'premisesId'
      const bookingId = 'bookingId'

      const requestHandler = departuresController.confirm()

      await requestHandler({ ...request, params: { premisesId, bookingId, departureId: departure.id } }, response, next)

      expect(response.render).toHaveBeenCalledWith('departures/confirm', {
        ...departure,
        premisesId,
        bookingId,
        pageHeading: 'Departure confirmed',
        name: booking.person.name,
        crn: booking.person.crn,
      })

      expect(departureService.getDeparture).toHaveBeenCalledWith(token, premisesId, bookingId, departure.id)
      expect(bookingService.find).toHaveBeenCalledWith(token, premisesId, bookingId)
    })
  })
})
