import type { Request, Response, NextFunction } from 'express'
import { createMock, DeepMocked } from '@golevelup/ts-jest'

import type { ErrorsAndUserInput } from 'approved-premises'
import ArrivalService from '../../services/arrivalService'
import ArrivalsController from './arrivalsController'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../utils/validation'
import paths from '../../paths/manage'

jest.mock('../../utils/validation')

describe('ArrivalsController', () => {
  const token = 'SOME_TOKEN'

  const request: DeepMocked<Request> = createMock<Request>({ user: { token } })
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const arrivalService = createMock<ArrivalService>({})
  const arrivalsController = new ArrivalsController(arrivalService)

  describe('new', () => {
    it('renders the form', () => {
      const requestHandler = arrivalsController.new()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({ errors: {}, errorSummary: [], userInput: {} })

      request.params = {
        bookingId: 'bookingId',
        premisesId: 'premisesId',
      }

      requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('arrivals/new', {
        premisesId: 'premisesId',
        bookingId: 'bookingId',
        pageHeading: 'Did the resident arrive?',
        errors: {},
        errorSummary: [],
      })
    })

    it('renders the form with errors and user input if an error has been sent to the flash', () => {
      const requestHandler = arrivalsController.new()

      request.params = {
        bookingId: 'bookingId',
        premisesId: 'premisesId',
      }

      const errorsAndUserInput = createMock<ErrorsAndUserInput>()

      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue(errorsAndUserInput)

      requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('arrivals/new', {
        premisesId: 'premisesId',
        bookingId: 'bookingId',
        pageHeading: 'Did the resident arrive?',
        errors: errorsAndUserInput.errors,
        errorSummary: errorsAndUserInput.errorSummary,
        ...errorsAndUserInput.userInput,
      })
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
        token,
        request.params.premisesId,
        request.params.bookingId,
        expectedArrival,
      )

      expect(request.flash).toHaveBeenCalledWith('success', 'Arrival logged')
      expect(response.redirect).toHaveBeenCalledWith(paths.premises.show({ premisesId: request.params.premisesId }))
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

      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        err,
        paths.bookings.arrivals.new({
          premisesId: request.params.premisesId,
          bookingId: request.params.bookingId,
        }),
      )
    })
  })
})
