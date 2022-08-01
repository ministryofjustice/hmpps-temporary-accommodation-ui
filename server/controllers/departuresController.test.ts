import type { Request, Response, NextFunction } from 'express'
import { createMock, DeepMocked } from '@golevelup/ts-jest'

import DepartureService from '../services/departureService'
import DeparturesController from './departuresController'
import { PremisesService } from '../services'

describe('DeparturesController', () => {
  const request: DeepMocked<Request> = createMock<Request>({})
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  let departuresController: DeparturesController
  let departureService: DeepMocked<DepartureService>
  let premisesService: DeepMocked<PremisesService>

  beforeEach(() => {
    departureService = createMock<DepartureService>({})
    premisesService = createMock<PremisesService>({})
    departuresController = new DeparturesController(departureService, premisesService)
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
    it('creates an Departure and redirects to the premises page', async () => {
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

      expect(response.redirect).toHaveBeenCalledWith(`/premises/${request.params.premisesId}`)
    })
  })
})
