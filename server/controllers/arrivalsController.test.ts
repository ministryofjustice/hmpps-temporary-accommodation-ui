import type { Request, Response, NextFunction } from 'express'
import { createMock, DeepMocked } from '@golevelup/ts-jest'

import ArrivalService from '../services/arrivalService'
import ArrivalsController from './arrivalsController'
import renderWithErrors from '../utils/validation'

jest.mock('../utils/validation')

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
    it('creates an arrival and redirects to the premises page', async () => {
      const requestHandler = arrivalsController.create()

      request.params = {
        bookingId: 'bookingId',
        premisesId: 'premisesId',
      }

      request.body = {
        'date-year': 2022,
        'date-month': 12,
        'date-day': 11,
        'expectedDepartureDate-year': 2022,
        'expectedDepartureDate-month': 11,
        'expectedDepartureDate-day': 12,
        notes: 'Some notes',
      }

      await requestHandler(request, response, next)

      const expectedArrival = {
        ...request.body.arrival,
        date: new Date(2022, 11, 11).toISOString(),
        expectedDepartureDate: new Date(2022, 10, 12).toISOString(),
      }

      expect(arrivalService.createArrival).toHaveBeenCalledWith(
        request.params.premisesId,
        request.params.bookingId,
        expectedArrival,
      )

      expect(response.redirect).toHaveBeenCalledWith(`/premises/${request.params.premisesId}`)
    })

    it('renders with errors if the API returns an error', async () => {
      const requestHandler = arrivalsController.create()

      request.params = {
        bookingId: 'bookingId',
        premisesId: 'premisesId',
      }

      const err = new Error()

      arrivalService.createArrival.mockImplementation(() => {
        throw err
      })

      await requestHandler(request, response, next)

      expect(renderWithErrors).toHaveBeenCalledWith(request, response, err, `arrivals/new`, {
        premisesId: request.params.premisesId,
        bookingId: request.params.bookingId,
        arrived: true,
      })
    })
  })
})
