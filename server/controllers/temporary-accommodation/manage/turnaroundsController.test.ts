import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import { BespokeError } from '../../../@types/ui'
import { CallConfig } from '../../../data/restClient'
import paths from '../../../paths/temporary-accommodation/manage'
import { BedspaceService, BookingService, PremisesService, TurnaroundService } from '../../../services'
import {
  bookingFactory,
  newTurnaroundFactory,
  premisesFactory,
  roomFactory,
  turnaroundFactory,
} from '../../../testutils/factories'
import { generateTurnaroundConflictBespokeError } from '../../../utils/bookingUtils'
import extractCallConfig from '../../../utils/restUtils'
import {
  catchValidationErrorOrPropogate,
  fetchErrorsAndUserInput,
  insertBespokeError,
  insertGenericError,
} from '../../../utils/validation'
import TurnaroundsController from './turnaroundsController'

jest.mock('../../../utils/validation')
jest.mock('../../../utils/bookingUtils')
jest.mock('../../../utils/restUtils')

describe('TurnaroundsController', () => {
  const callConfig = { token: 'some-call-config-token' } as CallConfig
  const premisesId = 'premisesId'
  const roomId = 'roomId'
  const bookingId = 'bookingId'

  let request: Request

  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const premisesService = createMock<PremisesService>({})
  const bedspaceService = createMock<BedspaceService>({})
  const bookingService = createMock<BookingService>({})
  const turnaroundService = createMock<TurnaroundService>({})

  const turnaroundsController = new TurnaroundsController(
    premisesService,
    bedspaceService,
    bookingService,
    turnaroundService,
  )

  beforeEach(() => {
    request = createMock<Request>()
    ;(extractCallConfig as jest.MockedFn<typeof extractCallConfig>).mockReturnValue(callConfig)
  })

  describe('new', () => {
    it('renders the form prepopulated with the current turnaround days', async () => {
      const premises = premisesFactory.build()
      const room = roomFactory.build()
      const booking = bookingFactory.arrived().build()

      request.params = {
        premisesId: premises.id,
        roomId: room.id,
        bookingId: booking.id,
      }

      premisesService.getPremises.mockResolvedValue(premises)
      bedspaceService.getRoom.mockResolvedValue(room)
      bookingService.getBooking.mockResolvedValue(booking)

      const requestHandler = turnaroundsController.new()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({ errors: {}, errorSummary: [], userInput: {} })

      await requestHandler(request, response, next)

      expect(bookingService.getBooking).toHaveBeenCalledWith(callConfig, premises.id, booking.id)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/turnarounds/new', {
        premises,
        room,
        booking,
        errors: {},
        errorSummary: [],
        workingDays: `${booking.turnaround.workingDays}`,
      })
    })
  })

  describe('create', () => {
    it('creates the turnaround and redirects to the show booking page', async () => {
      const requestHandler = turnaroundsController.create()

      const turnaround = turnaroundFactory.build()
      const newTurnaround = newTurnaroundFactory.build({
        ...turnaround,
      })

      request.params = {
        premisesId,
        roomId,
        bookingId,
      }
      request.body = {
        ...newTurnaround,
        workingDays: `${newTurnaround.workingDays}`,
      }

      turnaroundService.createTurnaround.mockResolvedValue(turnaround)

      await requestHandler(request, response, next)

      expect(turnaroundService.createTurnaround).toHaveBeenCalledWith(
        callConfig,
        premisesId,
        bookingId,
        expect.objectContaining(newTurnaround),
      )

      expect(request.flash).toHaveBeenCalledWith('success', 'Turnaround time changed')
      expect(response.redirect).toHaveBeenCalledWith(paths.bookings.show({ premisesId, roomId, bookingId }))
    })

    it('renders with errors if the API returns an error', async () => {
      const requestHandler = turnaroundsController.create()

      const turnaround = turnaroundFactory.build()
      const newTurnaround = newTurnaroundFactory.build({
        ...turnaround,
      })

      request.params = {
        premisesId,
        roomId,
        bookingId,
      }
      request.body = {
        ...newTurnaround,
        workingDays: `${newTurnaround.workingDays}`,
      }

      const err = new Error()
      turnaroundService.createTurnaround.mockImplementation(() => {
        throw err
      })

      await requestHandler(request, response, next)

      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        err,
        paths.bookings.turnarounds.new({ premisesId, roomId, bookingId }),
      )
    })

    it('renders with errors if the API returns a 409 Conflict status', async () => {
      const requestHandler = turnaroundsController.create()

      const turnaround = turnaroundFactory.build()
      const newTurnaround = newTurnaroundFactory.build({
        ...turnaround,
      })

      request.params = {
        premisesId,
        roomId,
        bookingId,
      }
      request.body = {
        ...newTurnaround,
        workingDays: `${newTurnaround.workingDays}`,
      }

      const err = { status: 409 }
      turnaroundService.createTurnaround.mockImplementation(() => {
        throw err
      })
      const bespokeError: BespokeError = {
        errorTitle: 'some-bespoke-error',
        errorSummary: [],
      }
      ;(
        generateTurnaroundConflictBespokeError as jest.MockedFunction<typeof generateTurnaroundConflictBespokeError>
      ).mockReturnValue(bespokeError)

      await requestHandler(request, response, next)

      expect(generateTurnaroundConflictBespokeError).toHaveBeenCalledWith(err, premisesId, roomId)
      expect(insertBespokeError).toHaveBeenCalledWith(err, bespokeError)
      expect(insertGenericError).toHaveBeenCalledWith(err, 'workingDays', 'conflict')
      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        err,
        paths.bookings.turnarounds.new({ premisesId, roomId, bookingId }),
      )
    })
  })
})
