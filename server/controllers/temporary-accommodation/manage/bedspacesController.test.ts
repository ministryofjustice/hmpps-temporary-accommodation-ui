import type { Request, Response, NextFunction } from 'express'
import { createMock, DeepMocked } from '@golevelup/ts-jest'

import paths from '../../../paths/temporary-accommodation/manage'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../../utils/validation'
import BedspaceService from '../../../services/bedspaceService'
import BedspacesController from './bedspacesController'
import roomFactory from '../../../testutils/factories/room'
import characteristicFactory from '../../../testutils/factories/characteristic'

jest.mock('../../../utils/validation')

describe('BedspacesController', () => {
  const token = 'SOME_TOKEN'
  const premisesId = 'premisesId'

  const request: DeepMocked<Request> = createMock<Request>({ user: { token } })
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const bedspaceService = createMock<BedspaceService>({})
  const bedspacesController = new BedspacesController(bedspaceService)

  describe('new', () => {
    it('renders the form', async () => {
      request.params = {
        premisesId,
      }

      const allCharacteristics = characteristicFactory.buildList(5)

      bedspaceService.getRoomCharacteristics.mockResolvedValue(allCharacteristics)

      const requestHandler = bedspacesController.new()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({ errors: {}, errorSummary: [], userInput: {} })

      await requestHandler(request, response, next)

      expect(bedspaceService.getRoomCharacteristics).toHaveBeenCalledWith(token)
      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/bedspaces/new', {
        premisesId,
        allCharacteristics,
        characteristicIds: [],
        errors: {},
        errorSummary: [],
      })
    })
  })

  describe('create', () => {
    it('creates a premises and redirects to the show premises page', async () => {
      const requestHandler = bedspacesController.create()

      const room = roomFactory.build()

      request.params = {
        premisesId,
      }
      request.body = {
        name: room.name,
        notes: room.notes,
      }

      bedspaceService.createRoom.mockResolvedValue(room)

      await requestHandler(request, response, next)

      expect(bedspaceService.createRoom).toHaveBeenCalledWith(token, premisesId, {
        name: room.name,
        characteristicIds: [],
        notes: room.notes,
      })

      expect(request.flash).toHaveBeenCalledWith('success', 'Bedspace created')
      expect(response.redirect).toHaveBeenCalledWith(paths.premises.show({ premisesId }))
    })

    it('renders with errors if the API returns an error', async () => {
      const requestHandler = bedspacesController.create()

      const err = new Error()

      bedspaceService.createRoom.mockImplementation(() => {
        throw err
      })

      const room = roomFactory.build()

      request.params = {
        premisesId,
      }
      request.body = {
        name: room.name,
        notes: room.notes,
      }

      await requestHandler(request, response, next)

      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        err,
        paths.premises.bedspaces.new({ premisesId }),
      )
    })
  })
})
