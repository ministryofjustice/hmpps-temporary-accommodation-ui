import { Request, Response, NextFunction } from 'express'
import { createMock, DeepMocked } from '@golevelup/ts-jest'
import NonArrivalService from '../services/nonArrivalService'

import NonArrivalsController from './nonArrivalsController'
import renderWithErrors from '../utils/renderWithErrors'

jest.mock('../utils/renderWithErrors')

describe('NonArrivalsController', () => {
  const request: DeepMocked<Request> = createMock<Request>({})
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  let nonArrivalsController: NonArrivalsController
  let nonArrivalService: DeepMocked<NonArrivalService>

  beforeEach(() => {
    nonArrivalService = createMock<NonArrivalService>({})
    nonArrivalsController = new NonArrivalsController(nonArrivalService)
  })

  describe('create', () => {
    it('creates an nonArrival and redirects to the premises page', async () => {
      const requestHandler = nonArrivalsController.create()

      request.params = {
        bookingId: 'bookingId',
        premisesId: 'premisesId',
      }

      request.body = {
        'nonArrivalDate-year': 2022,
        'nonArrivalDate-month': 12,
        'nonArrivalDate-day': 11,
        nonArrival: { notes: 'Some notes', reason: 'Some reason' },
      }

      await requestHandler(request, response, next)

      const expectedNonArrival = {
        ...request.body.nonArrival,
        date: new Date(2022, 11, 11).toISOString(),
      }

      expect(nonArrivalService.createNonArrival).toHaveBeenCalledWith(
        request.params.premisesId,
        request.params.bookingId,
        expectedNonArrival,
      )

      expect(response.redirect).toHaveBeenCalledWith(`/premises/${request.params.premisesId}`)
    })

    it('renders with errors if the API returns an error', async () => {
      const requestHandler = nonArrivalsController.create()

      request.params = {
        bookingId: 'bookingId',
        premisesId: 'premisesId',
      }

      const err = new Error()

      nonArrivalService.createNonArrival.mockImplementation(() => {
        throw err
      })

      await requestHandler(request, response, next)

      expect(renderWithErrors).toHaveBeenCalledWith(request, response, err, `arrivals/new`, {
        premisesId: request.params.premisesId,
        bookingId: request.params.bookingId,
        arrived: false,
      })
    })
  })
})
