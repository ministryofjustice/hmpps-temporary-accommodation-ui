import { Request, Response, NextFunction } from 'express'
import { createMock, DeepMocked } from '@golevelup/ts-jest'
import type { ErrorsAndUserInput } from '@approved-premises/ui'

import NonArrivalService from '../../services/nonArrivalService'
import NonArrivalsController from './nonArrivalsController'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../utils/validation'
import paths from '../../paths/manage'

jest.mock('../../utils/validation')

describe('NonArrivalsController', () => {
  const token = 'SOME_TOKEN'

  const request: DeepMocked<Request> = createMock<Request>({ user: { token } })
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const nonArrivalService = createMock<NonArrivalService>({})
  const nonarrivalsController = new NonArrivalsController(nonArrivalService)

  describe('new', () => {
    it('renders the form', async () => {
      const requestHandler = nonarrivalsController.new()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({ errors: {}, errorSummary: [], userInput: {} })

      request.params = {
        bookingId: 'bookingId',
        premisesId: 'premisesId',
      }

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('nonarrivals/new', {
        premisesId: 'premisesId',
        bookingId: 'bookingId',
        pageHeading: 'Mark the resident as not arrived',
        errors: {},
        errorSummary: [],
      })
    })

    it('renders the form with errors and user input if an error has been sent to the flash', async () => {
      const requestHandler = nonarrivalsController.new()

      request.params = {
        bookingId: 'bookingId',
        premisesId: 'premisesId',
      }

      const errorsAndUserInput = createMock<ErrorsAndUserInput>()

      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue(errorsAndUserInput)

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('nonarrivals/new', {
        premisesId: 'premisesId',
        bookingId: 'bookingId',
        pageHeading: 'Mark the resident as not arrived',
        errors: errorsAndUserInput.errors,
        errorSummary: errorsAndUserInput.errorSummary,
        ...errorsAndUserInput.userInput,
      })
    })
  })

  describe('create', () => {
    it('creates an nonArrival and redirects to the premises page', async () => {
      const requestHandler = nonarrivalsController.create()

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
        date: '2022-12-11',
      }

      expect(response.redirect).toHaveBeenCalledWith(paths.premises.show({ premisesId: request.params.premisesId }))

      expect(request.flash).toHaveBeenCalledWith('success', 'Non-arrival logged')
      expect(nonArrivalService.createNonArrival).toHaveBeenCalledWith(
        token,
        request.params.premisesId,
        request.params.bookingId,
        expectedNonArrival,
      )
    })

    it('renders with errors if the API returns an error', async () => {
      const requestHandler = nonarrivalsController.create()

      request.params = {
        bookingId: 'bookingId',
        premisesId: 'premisesId',
      }

      const err = new Error()

      nonArrivalService.createNonArrival.mockImplementation(() => {
        throw err
      })

      await requestHandler(request, response, next)

      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        err,
        paths.bookings.nonArrivals.new({ premisesId: request.params.premisesId, bookingId: request.params.bookingId }),
      )
    })
  })
})
