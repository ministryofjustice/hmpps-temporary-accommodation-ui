import type { Request, Response, NextFunction } from 'express'
import { createMock, DeepMocked } from '@golevelup/ts-jest'

import paths from '../../../paths/temporary-accommodation/manage'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../../utils/validation'
import BedspaceService from '../../../services/bedspaceService'
import BedspacesController from './bedspacesController'
import premisesFactory from '../../../testutils/factories/premises'
import roomFactory from '../../../testutils/factories/room'
import characteristicFactory from '../../../testutils/factories/characteristic'
import updateRoomFactory from '../../../testutils/factories/updateRoom'
import { ErrorsAndUserInput, SummaryListItem } from '../../../@types/ui'
import { PremisesService } from '../../../services'

jest.mock('../../../utils/validation')

describe('BedspacesController', () => {
  const token = 'SOME_TOKEN'
  const premisesId = 'premisesId'

  let request: DeepMocked<Request>

  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const premisesService = createMock<PremisesService>({})
  const bedspaceService = createMock<BedspaceService>({})
  const bedspacesController = new BedspacesController(premisesService, bedspaceService)

  beforeEach(() => {
    request = createMock<Request>({ user: { token } })
  })

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

  describe('edit', () => {
    it('renders the form', async () => {
      const allCharacteristics = characteristicFactory.buildList(5)
      bedspaceService.getRoomCharacteristics.mockResolvedValue(allCharacteristics)

      const room = roomFactory.build()
      const updateRoom = updateRoomFactory.build({
        ...room,
      })
      bedspaceService.getUpdateRoom.mockResolvedValue(updateRoom)

      const requestHandler = bedspacesController.edit()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({ errors: {}, errorSummary: [], userInput: {} })

      request.params = { premisesId, roomId: room.id }
      await requestHandler(request, response, next)

      expect(bedspaceService.getRoomCharacteristics).toHaveBeenCalledWith(token)
      expect(bedspaceService.getUpdateRoom).toHaveBeenCalledWith(token, premisesId, room.id)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/bedspaces/edit', {
        allCharacteristics,
        characteristicIds: [],
        premisesId,
        errors: {},
        errorSummary: [],
        ...updateRoom,
      })
    })

    it('renders the form with errors and user input if an error has been sent to the flash', async () => {
      const allCharacteristics = characteristicFactory.buildList(5)
      bedspaceService.getRoomCharacteristics.mockResolvedValue(allCharacteristics)

      const room = roomFactory.build()
      const updateRoom = updateRoomFactory.build({
        ...room,
      })
      bedspaceService.getUpdateRoom.mockResolvedValue(updateRoom)

      const requestHandler = bedspacesController.edit()

      const errorsAndUserInput = createMock<ErrorsAndUserInput>()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue(errorsAndUserInput)

      request.params = { premisesId, roomId: room.id }
      await requestHandler(request, response, next)

      expect(bedspaceService.getRoomCharacteristics).toHaveBeenCalledWith(token)
      expect(bedspaceService.getUpdateRoom).toHaveBeenCalledWith(token, premisesId, room.id)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/bedspaces/edit', {
        allCharacteristics,
        characteristicIds: [],
        errors: errorsAndUserInput.errors,
        errorSummary: errorsAndUserInput.errorSummary,
        premisesId,
        ...errorsAndUserInput.userInput,
        ...updateRoom,
      })
    })
  })

  describe('update', () => {
    it('updates a bedspace and redirects to the show premises page', async () => {
      const requestHandler = bedspacesController.update()

      const room = roomFactory.build()

      request.params = { premisesId, roomId: room.id }
      request.body = {
        name: room.name,
        notes: room.notes,
      }

      bedspaceService.updateRoom.mockResolvedValue(room)

      await requestHandler(request, response, next)

      expect(bedspaceService.updateRoom).toHaveBeenCalledWith(token, premisesId, room.id, {
        name: room.name,
        notes: room.notes,
        characteristicIds: [],
      })

      expect(request.flash).toHaveBeenCalledWith('success', 'Bedspace updated')
      expect(response.redirect).toHaveBeenCalledWith(paths.premises.show({ premisesId }))
    })

    it('renders with errors if the API returns an error', async () => {
      const requestHandler = bedspacesController.update()

      const room = roomFactory.build()

      const err = new Error()

      bedspaceService.updateRoom.mockImplementation(() => {
        throw err
      })

      request.params = { premisesId, roomId: room.id }
      request.body = {
        name: room.name,
        notes: room.notes,
      }

      await requestHandler(request, response, next)

      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        err,
        paths.premises.bedspaces.edit({ premisesId, roomId: room.id }),
      )
    })
  })

  describe('show', () => {
    it('returns the bedspace details to the template', async () => {
      const premises = premisesFactory.build()
      const room = roomFactory.build()

      premisesService.getPremises.mockResolvedValue(premises)

      const bedspaceDetails = { room, summaryList: { rows: [] as Array<SummaryListItem> } }
      bedspaceService.getSingleBedspaceDetails.mockResolvedValue(bedspaceDetails)

      request.params = { premisesId: premises.id, roomId: room.id }

      const requestHandler = bedspacesController.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/bedspaces/show', {
        premises,
        bedspace: bedspaceDetails,
      })

      expect(premisesService.getPremises).toHaveBeenCalledWith(token, premises.id)
      expect(bedspaceService.getSingleBedspaceDetails).toHaveBeenCalledWith(token, premises.id, room.id)
    })
  })
})
