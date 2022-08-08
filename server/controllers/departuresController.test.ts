import type { Request, Response, NextFunction } from 'express'
import { createMock, DeepMocked } from '@golevelup/ts-jest'

import DepartureService from '../services/departureService'
import DeparturesController from './departuresController'
import { PremisesService } from '../services'
import BookingService from '../services/bookingService'
import departureFactory from '../testutils/factories/departure'
import bookingFactory from '../testutils/factories/booking'
import renderWithErrors from '../utils/renderWithErrors'

jest.mock('../utils/renderWithErrors')

describe('DeparturesController', () => {
  let request: DeepMocked<Request> = createMock<Request>({})
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  let departuresController: DeparturesController
  let departureService: DeepMocked<DepartureService>
  let premisesService: DeepMocked<PremisesService>
  let bookingService: DeepMocked<BookingService>

  beforeEach(() => {
    jest.resetAllMocks()
    request = createMock<Request>({})
    departureService = createMock<DepartureService>({})
    premisesService = createMock<PremisesService>({})
    bookingService = createMock<BookingService>({})
    departuresController = new DeparturesController(departureService, premisesService, bookingService)
  })

  describe('new', () => {
    it('renders the form', async () => {
      const booking = bookingFactory.build()
      const bookingId = 'bookingId'
      const premisesId = 'premisesId'
      premisesService.getPremisesSelectList.mockResolvedValue([{ value: 'id', text: 'name' }])
      bookingService.getBooking.mockResolvedValue(booking)
      const requestHandler = departuresController.new()

      request.params = {
        bookingId,
        premisesId,
      }

      await requestHandler(request, response, next)

      expect(premisesService.getPremisesSelectList).toHaveBeenCalled()
      expect(bookingService.getBooking).toHaveBeenCalledWith('premisesId', 'bookingId')
      expect(response.render).toHaveBeenCalledWith('departures/new', {
        premisesId,
        booking,
        premisesSelectList: [
          {
            text: 'name',
            value: 'id',
          },
        ],
      })
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
          CRN: 'A123456',
        },
      }

      await requestHandler(request, response, next)

      const expectedDeparture = {
        ...request.body.departure,
        dateTime: new Date(2022, 11, 11, 12, 35).toISOString(),
      }

      expect(departureService.createDeparture).toHaveBeenCalledWith(
        request.params.premisesId,
        request.params.bookingId,
        expectedDeparture,
      )

      expect(response.redirect).toHaveBeenCalledWith(
        `/premises/premisesId/bookings/bookingId/departures/${departure.id}/confirmation`,
      )
    })

    it('should render the page with errors when the API returns an error', async () => {
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

      expect(renderWithErrors).toHaveBeenCalledWith(request, response, err, 'departures/new', {
        booking: {},
        premisesId,
        premisesSelectList: {},
      })
    })
  })

  describe('confirm', () => {
    it('renders the confirmation page', async () => {
      const booking = bookingFactory.build()
      bookingService.getBooking.mockResolvedValue(booking)

      const departure = departureFactory.build()
      departureService.getDeparture.mockResolvedValue(departure)

      const premisesId = 'premisesId'
      const bookingId = 'bookingId'
      const requestHandler = departuresController.confirm()

      request.params = {
        premisesId,
        bookingId,
        departureId: departure.id,
      }

      await requestHandler(request, response, next)

      expect(departureService.getDeparture).toHaveBeenCalledWith(premisesId, bookingId, departure.id)
      expect(bookingService.getBooking).toHaveBeenCalledWith(premisesId, bookingId)
      expect(response.render).toHaveBeenCalledWith('departures/confirm', {
        ...departure,
        name: booking.name,
        CRN: booking.CRN,
      })
    })
  })
})
