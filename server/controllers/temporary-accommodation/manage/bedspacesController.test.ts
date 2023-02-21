import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import paths from '../../../paths/temporary-accommodation/manage'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../../utils/validation'
import BedspaceService from '../../../services/bedspaceService'
import BedspacesController from './bedspacesController'
import premisesFactory from '../../../testutils/factories/premises'
import roomFactory from '../../../testutils/factories/room'
import updateRoomFactory from '../../../testutils/factories/updateRoom'
import { ErrorsAndUserInput, SummaryListItem, TableRow } from '../../../@types/ui'
import { BookingService, PremisesService } from '../../../services'
import referenceDataFactory from '../../../testutils/factories/referenceData'
import { CallConfig } from '../../../data/restClient'
import extractCallConfig from '../../../utils/restUtils'

jest.mock('../../../utils/validation')
jest.mock('../../../utils/restUtils')
jest.mock('../../../utils/restUtils')

describe('BedspacesController', () => {
  const callConfig = { token: 'some-call-config-token' } as CallConfig
  const premisesId = 'premisesId'

  const referenceData = {
    characteristics: referenceDataFactory.characteristic('room').buildList(5),
  }

  let request: Request

  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const premisesService = createMock<PremisesService>({})
  const bedspaceService = createMock<BedspaceService>({})
  const bookingService = createMock<BookingService>({})
  const bedspacesController = new BedspacesController(premisesService, bedspaceService, bookingService)

  beforeEach(() => {
    request = createMock<Request>()
    ;(extractCallConfig as jest.MockedFn<typeof extractCallConfig>).mockReturnValue(callConfig)
  })

  describe('new', () => {
    it('renders the form', async () => {
      request.params = {
        premisesId,
      }

      bedspaceService.getReferenceData.mockResolvedValue(referenceData)

      const requestHandler = bedspacesController.new()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({ errors: {}, errorSummary: [], userInput: {} })

      await requestHandler(request, response, next)

      expect(bedspaceService.getReferenceData).toHaveBeenCalledWith(callConfig)
      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/bedspaces/new', {
        premisesId,
        allCharacteristics: referenceData.characteristics,
        characteristicIds: [],
        errors: {},
        errorSummary: [],
      })
    })
  })

  describe('create', () => {
    it('creates a bedspace and redirects to the show bedspace page', async () => {
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

      expect(bedspaceService.createRoom).toHaveBeenCalledWith(callConfig, premisesId, {
        name: room.name,
        characteristicIds: [],
        notes: room.notes,
      })

      expect(request.flash).toHaveBeenCalledWith('success', 'Bedspace created')
      expect(response.redirect).toHaveBeenCalledWith(paths.premises.bedspaces.show({ premisesId, roomId: room.id }))
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
      bedspaceService.getReferenceData.mockResolvedValue(referenceData)

      const room = roomFactory.build()
      const updateRoom = updateRoomFactory.build({
        ...room,
      })
      bedspaceService.getUpdateRoom.mockResolvedValue(updateRoom)

      const requestHandler = bedspacesController.edit()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({ errors: {}, errorSummary: [], userInput: {} })

      request.params = { premisesId, roomId: room.id }
      await requestHandler(request, response, next)

      expect(bedspaceService.getReferenceData).toHaveBeenCalledWith(callConfig)
      expect(bedspaceService.getUpdateRoom).toHaveBeenCalledWith(callConfig, premisesId, room.id)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/bedspaces/edit', {
        allCharacteristics: referenceData.characteristics,
        characteristicIds: [],
        premisesId,
        errors: {},
        errorSummary: [],
        ...updateRoom,
      })
    })

    it('renders the form with errors and user input if an error has been sent to the flash', async () => {
      bedspaceService.getReferenceData.mockResolvedValue(referenceData)

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

      expect(bedspaceService.getReferenceData).toHaveBeenCalledWith(callConfig)
      expect(bedspaceService.getUpdateRoom).toHaveBeenCalledWith(callConfig, premisesId, room.id)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/bedspaces/edit', {
        allCharacteristics: referenceData.characteristics,
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
    it('updates a bedspace and redirects to the show bedspace page', async () => {
      const requestHandler = bedspacesController.update()

      const room = roomFactory.build()

      request.params = { premisesId, roomId: room.id }
      request.body = {
        name: room.name,
        notes: room.notes,
      }

      bedspaceService.updateRoom.mockResolvedValue(room)

      await requestHandler(request, response, next)

      expect(bedspaceService.updateRoom).toHaveBeenCalledWith(callConfig, premisesId, room.id, {
        name: room.name,
        notes: room.notes,
        characteristicIds: [],
      })

      expect(request.flash).toHaveBeenCalledWith('success', 'Bedspace updated')
      expect(response.redirect).toHaveBeenCalledWith(paths.premises.bedspaces.show({ premisesId, roomId: room.id }))
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

      const bookingTableRows: Array<TableRow> = []
      bookingService.getTableRowsForBedspace.mockResolvedValue([])

      request.params = { premisesId: premises.id, roomId: room.id }

      const requestHandler = bedspacesController.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/bedspaces/show', {
        premises,
        bedspace: bedspaceDetails,
        bookingTableRows,
      })

      expect(premisesService.getPremises).toHaveBeenCalledWith(callConfig, premises.id)
      expect(bedspaceService.getSingleBedspaceDetails).toHaveBeenCalledWith(callConfig, premises.id, room.id)
      expect(bookingService.getTableRowsForBedspace).toHaveBeenCalledWith(callConfig, premises.id, room.id)
    })
  })
})
