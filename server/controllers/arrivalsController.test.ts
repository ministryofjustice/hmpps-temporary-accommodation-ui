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
})
