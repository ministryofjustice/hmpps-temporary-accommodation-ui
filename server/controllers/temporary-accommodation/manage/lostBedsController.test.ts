import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import lostBedFactory from '../../../testutils/factories/lostBed'
import newLostBedFactory from '../../../testutils/factories/newLostBed'
import { LostBedService, PremisesService } from '../../../services'
import BedspaceService from '../../../services/bedspaceService'
import { CallConfig } from '../../../data/restClient'
import LostBedsController from './lostBedsController'
import extractCallConfig from '../../../utils/restUtils'
import paths from '../../../paths/temporary-accommodation/manage'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../../utils/validation'
import premisesFactory from '../../../testutils/factories/premises'
import roomFactory from '../../../testutils/factories/room'
import { allStatuses } from '../../../utils/lostBedUtils'
import { DateFormats } from '../../../utils/dateUtils'

jest.mock('../../../utils/restUtils')
jest.mock('../../../utils/validation')

describe('LostBedsController', () => {
  const callConfig = { token: 'some-call-config-token' } as CallConfig
  const premisesId = 'premisesId'
  const roomId = 'roomId'

  let request: Request

  let response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const lostBedService = createMock<LostBedService>({})
  const premisesService = createMock<PremisesService>({})
  const bedspaceService = createMock<BedspaceService>({})

  const lostBedsController = new LostBedsController(lostBedService, premisesService, bedspaceService)

  beforeEach(() => {
    request = createMock<Request>()
    response = createMock<Response>({})
    ;(extractCallConfig as jest.MockedFn<typeof extractCallConfig>).mockReturnValue(callConfig)
  })

  describe('new', () => {
    it('renders the form', async () => {
      request.params = {
        premisesId,
        roomId,
      }

      const premises = premisesFactory.build()
      const room = roomFactory.build()

      premisesService.getPremises.mockResolvedValue(premises)
      bedspaceService.getRoom.mockResolvedValue(room)

      const requestHandler = lostBedsController.new()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({ errors: {}, errorSummary: [], userInput: {} })

      await requestHandler(request, response, next)

      expect(premisesService.getPremises).toHaveBeenCalledWith(callConfig, premisesId)
      expect(bedspaceService.getRoom).toHaveBeenCalledWith(callConfig, premisesId, roomId)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/lost-beds/new', {
        premises,
        room,
        errors: {},
        errorSummary: [],
      })
    })

    describe('create', () => {
      it('creates a lost bed and redirects to the show lost bed page', async () => {
        const requestHandler = lostBedsController.create()

        const lostBed = lostBedFactory.build()
        const newLostBed = newLostBedFactory.build({ ...lostBed, reason: lostBed.reason.id })

        lostBedService.create.mockResolvedValue(lostBed)

        request.params = {
          premisesId,
          roomId,
        }

        request.body = {
          ...newLostBed,
          ...DateFormats.convertIsoToDateAndTimeInputs(lostBed.startDate, 'startDate'),
          ...DateFormats.convertIsoToDateAndTimeInputs(lostBed.endDate, 'endDate'),
        }

        await requestHandler(request, response, next)

        expect(lostBedService.create).toHaveBeenCalledWith(callConfig, premisesId, expect.objectContaining(newLostBed))

        expect(request.flash).toHaveBeenCalledWith('success', 'Void created')
        expect(response.redirect).toHaveBeenCalledWith(
          paths.lostBeds.show({ premisesId, roomId, lostBedId: lostBed.id }),
        )
      })

      it('renders with errors if the API returns an error', async () => {
        const requestHandler = lostBedsController.create()

        const err = { status: 409 }
        lostBedService.create.mockImplementation(() => {
          throw err
        })

        request.params = {
          premisesId,
          roomId,
        }

        await requestHandler(request, response, next)

        expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
          request,
          response,
          err,
          paths.lostBeds.new({ premisesId, roomId }),
        )
      })

      it('renders with errors if the API returns a 409 Conflict status', async () => {
        const requestHandler = lostBedsController.create()

        const err = { status: 409 }
        lostBedService.create.mockImplementation(() => {
          throw err
        })

        request.params = {
          premisesId,
          roomId,
        }

        await requestHandler(request, response, next)

        expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
          request,
          response,
          err,
          paths.lostBeds.new({ premisesId, roomId }),
        )
      })
    })

    describe('show', () => {
      it('renders the template for viewing a lost bed', async () => {
        const premises = premisesFactory.build()
        const room = roomFactory.build()
        const lostBed = lostBedFactory.build()

        premisesService.getPremises.mockResolvedValue(premises)
        bedspaceService.getRoom.mockResolvedValue(room)
        lostBedService.find.mockResolvedValue(lostBed)

        request.params = {
          premisesId: premises.id,
          roomId: room.id,
          lostBedId: lostBed.id,
        }

        const requestHandler = lostBedsController.show()
        await requestHandler(request, response, next)

        expect(response.render).toHaveBeenCalledWith('temporary-accommodation/lost-beds/show', {
          premises,
          room,
          lostBed,
          allStatuses,
        })
      })
    })
  })
})
