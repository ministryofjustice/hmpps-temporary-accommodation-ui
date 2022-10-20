import type { Request, Response, NextFunction } from 'express'
import { createMock, DeepMocked } from '@golevelup/ts-jest'

import type { ErrorsAndUserInput } from '@approved-premises/ui'
import ArrivalService from '../../services/arrivalService'
import PremisesService from '../../services/premisesService'
import ArrivalsController from './arrivalsController'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../utils/validation'
import paths from '../../paths/manage'
import staffMemberFactory from '../../testutils/factories/staffMember'

jest.mock('../../utils/validation')

describe('ArrivalsController', () => {
  const token = 'SOME_TOKEN'

  const request: DeepMocked<Request> = createMock<Request>({ user: { token } })
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const arrivalService = createMock<ArrivalService>({})
  const premisesService = createMock<PremisesService>({})

  const arrivalsController = new ArrivalsController(arrivalService, premisesService)

  describe('new', () => {
    const staffMembers = staffMemberFactory.buildList(5)

    beforeEach(() => {
      premisesService.getStaffMembers.mockResolvedValue(staffMembers)
    })

    it('renders the form', async () => {
      const requestHandler = arrivalsController.new()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({ errors: {}, errorSummary: [], userInput: {} })

      request.params = {
        bookingId: 'bookingId',
        premisesId: 'premisesId',
      }

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('arrivals/new', {
        premisesId: 'premisesId',
        bookingId: 'bookingId',
        pageHeading: 'Record an arrival',
        errors: {},
        errorSummary: [],
        staffMembers,
      })
    })

    it('renders the form with errors and user input if an error has been sent to the flash', async () => {
      const requestHandler = arrivalsController.new()

      request.params = {
        bookingId: 'bookingId',
        premisesId: 'premisesId',
      }

      const errorsAndUserInput = createMock<ErrorsAndUserInput>()

      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue(errorsAndUserInput)

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('arrivals/new', {
        premisesId: 'premisesId',
        bookingId: 'bookingId',
        pageHeading: 'Record an arrival',
        errors: errorsAndUserInput.errors,
        errorSummary: errorsAndUserInput.errorSummary,
        staffMembers,
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
        'arrivalDate-year': 2022,
        'arrivalDate-month': 12,
        'arrivalDate-day': 11,
        'expectedDepartureDate-year': 2022,
        'expectedDepartureDate-month': 11,
        'expectedDepartureDate-day': 12,
        arrival: {
          notes: 'Some notes',
          keyWorkerStaffId: 'some-staff-id',
        },
      }

      await requestHandler(request, response, next)

      const expectedArrival = {
        notes: request.body.arrival.notes,
        keyWorkerStaffId: request.body.arrival.keyWorkerStaffId,
        arrivalDate: '2022-12-11',
        expectedDepartureDate: '2022-11-12',
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
