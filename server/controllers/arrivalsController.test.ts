import type { Request, Response, NextFunction } from 'express'
import { createMock, DeepMocked } from '@golevelup/ts-jest'

import ArrivalService from '../services/arrivalService'
import ArrivalsController from './arrivalsController'

describe('ArrivalsController', () => {
  const request: DeepMocked<Request> = createMock<Request>({})
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  let arrivalsController: ArrivalsController
  let arrivalService: DeepMocked<ArrivalService>

  beforeEach(() => {
    arrivalService = createMock<ArrivalService>({})
    arrivalsController = new ArrivalsController(arrivalService)
  })

  describe('new', () => {
    it('renders the form', () => {
      const requestHandler = arrivalsController.new()

      request.params = {
        bookingId: 'bookingId',
        premisesId: 'premisesId',
      }

      requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('arrivals/new', { premisesId: 'premisesId', bookingId: 'bookingId' })
    })
  })

  describe('create', () => {
    it('creates an arrival and redirects to the premises page', () => {
      const requestHandler = arrivalsController.create()

      request.params = {
        bookingId: 'bookingId',
        premisesId: 'premisesId',
      }

      request.body = {
        'dateTime-year': 2022,
        'dateTime-month': 12,
        'dateTime-day': 11,
        'expectedDeparture-year': 2022,
        'expectedDeparture-month': 11,
        'expectedDeparture-day': 12,
        notes: 'Some notes',
      }

      requestHandler(request, response, next)

      const expectedArrival = {
        ...request.body,
        dateTime: new Date(2022, 11, 11),
        expectedDeparture: new Date(2022, 10, 12),
      }

      expect(arrivalService.createArrival).toHaveBeenCalledWith(
        request.params.premisesId,
        request.params.bookingId,
        expectedArrival,
      )

      expect(response.redirect).toHaveBeenCalledWith(`/premises/${request.params.premisesId}`)
    })
  })
})
