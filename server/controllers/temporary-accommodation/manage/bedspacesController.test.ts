import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import { ErrorsAndUserInput, SummaryListItem } from '../../../@types/ui'
import { CallConfig } from '../../../data/restClient'
import paths from '../../../paths/temporary-accommodation/manage'
import { AssessmentsService, BookingService, PremisesService } from '../../../services'
import BedspaceService from '../../../services/bedspaceService'
import { ListingEntry } from '../../../services/bookingService'
import {
  characteristicFactory,
  newRoomFactory,
  premisesFactory,
  referenceDataFactory,
  roomFactory,
  updateRoomFactory,
} from '../../../testutils/factories'
import { bedspaceActions, insertEndDateErrors } from '../../../utils/bedspaceUtils'
import extractCallConfig from '../../../utils/restUtils'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../../utils/validation'
import BedspacesController from './bedspacesController'
import { preservePlaceContext } from '../../../utils/placeUtils'
import { DateFormats } from '../../../utils/dateUtils'

jest.mock('../../../utils/validation')
jest.mock('../../../utils/restUtils')
jest.mock('../../../utils/bedspaceUtils')
jest.mock('../../../utils/placeUtils')

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
  const assessmentService = createMock<AssessmentsService>({})
  const bedspacesController = new BedspacesController(
    premisesService,
    bedspaceService,
    bookingService,
    assessmentService,
  )

  beforeEach(() => {
    request = createMock<Request>()
    ;(extractCallConfig as jest.MockedFn<typeof extractCallConfig>).mockReturnValue(callConfig)
  })

  describe('new', () => {
    it('renders the form', async () => {
      const premises = premisesFactory.build()

      bedspaceService.getReferenceData.mockResolvedValue(referenceData)
      premisesService.getPremises.mockResolvedValue(premises)

      const requestHandler = bedspacesController.new()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({ errors: {}, errorSummary: [], userInput: {} })

      request.params = { premisesId: premises.id }
      await requestHandler(request, response, next)

      expect(bedspaceService.getReferenceData).toHaveBeenCalledWith(callConfig)
      expect(premisesService.getPremises).toHaveBeenCalledWith(callConfig, premises.id)
      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/bedspaces/new', {
        allCharacteristics: referenceData.characteristics,
        characteristicIds: [],
        premises,
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
        ...DateFormats.isoToDateAndTimeInputs(room.beds[0].bedEndDate, 'bedEndDate'),
      }

      bedspaceService.createRoom.mockResolvedValue(room)

      await requestHandler(request, response, next)

      expect(bedspaceService.createRoom).toHaveBeenCalledWith(
        callConfig,
        premisesId,
        expect.objectContaining({
          name: room.name,
          characteristicIds: [],
          notes: room.notes,
          bedEndDate: room.beds[0].bedEndDate,
        }),
      )

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

      const premises = premisesFactory.build()
      const room = roomFactory.build()
      const updateRoom = updateRoomFactory.build({
        ...room,
      })

      bedspaceService.getUpdateRoom.mockResolvedValue(updateRoom)
      premisesService.getPremises.mockResolvedValue(premises)

      const requestHandler = bedspacesController.edit()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({ errors: {}, errorSummary: [], userInput: {} })

      request.params = { premisesId: premises.id, roomId: room.id }
      await requestHandler(request, response, next)

      expect(bedspaceService.getReferenceData).toHaveBeenCalledWith(callConfig)
      expect(bedspaceService.getUpdateRoom).toHaveBeenCalledWith(callConfig, premises.id, room.id)
      expect(premisesService.getPremises).toHaveBeenCalledWith(callConfig, premises.id)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/bedspaces/edit', {
        allCharacteristics: referenceData.characteristics,
        characteristicIds: [],
        premises,
        errors: {},
        errorSummary: [],
        ...updateRoom,
      })
    })

    it('renders the form with errors and user input if an error has been sent to the flash', async () => {
      bedspaceService.getReferenceData.mockResolvedValue(referenceData)

      const premises = premisesFactory.build()
      const room = roomFactory.build()
      const updateRoom = updateRoomFactory.build({
        ...room,
      })

      bedspaceService.getUpdateRoom.mockResolvedValue(updateRoom)
      premisesService.getPremises.mockResolvedValue(premises)

      const requestHandler = bedspacesController.edit()

      const errorsAndUserInput = createMock<ErrorsAndUserInput>()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue(errorsAndUserInput)

      request.params = { premisesId: premises.id, roomId: room.id }
      await requestHandler(request, response, next)

      expect(bedspaceService.getReferenceData).toHaveBeenCalledWith(callConfig)
      expect(bedspaceService.getUpdateRoom).toHaveBeenCalledWith(callConfig, premises.id, room.id)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/bedspaces/edit', {
        allCharacteristics: referenceData.characteristics,
        characteristicIds: [],
        errors: errorsAndUserInput.errors,
        errorSummary: errorsAndUserInput.errorSummary,
        premises,
        ...errorsAndUserInput.userInput,
        ...updateRoom,
      })
    })
  })

  describe('update', () => {
    it('updates a bedspace and redirects to the show bedspace page', async () => {
      const requestHandler = bedspacesController.update()

      const premises = premisesFactory.build({ status: 'active' })
      const room = roomFactory.build()

      request.params = { premisesId: premises.id, roomId: room.id }
      request.body = {
        name: room.name,
        notes: room.notes,
        ...DateFormats.isoToDateAndTimeInputs(room.beds[0].bedEndDate, 'bedEndDate'),
      }

      premisesService.getPremises.mockResolvedValue(premises)
      bedspaceService.updateRoom.mockResolvedValue(room)

      await requestHandler(request, response, next)

      expect(premisesService.getPremises).toHaveBeenCalledWith(callConfig, premises.id)
      expect(bedspaceService.updateRoom).toHaveBeenCalledWith(
        callConfig,
        premises.id,
        room.id,
        expect.objectContaining({
          name: room.name,
          notes: room.notes,
          characteristicIds: [],
          bedEndDate: room.beds[0].bedEndDate,
        }),
      )

      expect(request.flash).toHaveBeenCalledWith('success', 'Bedspace updated')
      expect(response.redirect).toHaveBeenCalledWith(
        paths.premises.bedspaces.show({ premisesId: premises.id, roomId: room.id }),
      )
    })

    it('renders the correct success message when the premises is archived', async () => {
      const requestHandler = bedspacesController.update()

      const premises = premisesFactory.build({ status: 'archived' })
      const room = roomFactory.build()

      request.params = { premisesId: premises.id, roomId: room.id }
      request.body = {
        name: room.name,
        notes: room.notes,
      }

      premisesService.getPremises.mockResolvedValue(premises)
      bedspaceService.updateRoom.mockResolvedValue(room)

      await requestHandler(request, response, next)

      expect(premisesService.getPremises).toHaveBeenCalledWith(callConfig, premises.id)
      expect(bedspaceService.updateRoom).toHaveBeenCalledWith(callConfig, premises.id, room.id, {
        name: room.name,
        notes: room.notes,
        characteristicIds: [],
      })

      expect(request.flash).toHaveBeenCalledWith('success', {
        title: 'Bedspace updated',
        text: 'This bedspace is in an archived property',
      })
      expect(response.redirect).toHaveBeenCalledWith(
        paths.premises.bedspaces.show({ premisesId: premises.id, roomId: room.id }),
      )
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

    it('renders an error if the bedspace end date is before the created date', async () => {
      const requestHandler = bedspacesController.update()

      const room = roomFactory.build()

      const err = {
        status: 400,
        data: {
          title: 'Bad Request',
          detail: 'Bedspace end date cannot be prior to the Bedspace creation date: 2024-03-28',
        },
      }

      bedspaceService.updateRoom.mockImplementation(() => {
        throw err
      })

      request.params = { premisesId, roomId: room.id }
      request.body = {
        name: room.name,
      }

      await requestHandler(request, response, next)

      expect(insertEndDateErrors).toHaveBeenCalledWith(err, premisesId, room.id)
      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        err,
        paths.premises.bedspaces.edit({ premisesId, roomId: room.id }),
      )
    })

    it('renders an error if the bedspace end date conflicts with a booking', async () => {
      const requestHandler = bedspacesController.update()

      const room = roomFactory.build()

      const err = {
        status: 409,
        data: {
          title: 'Conflict',
          detail: 'Conflict booking exists for the room with end date 2024-07-07: 82c03c63-321a-45dd-811d-be87a41f5780',
        },
      }

      bedspaceService.updateRoom.mockImplementation(() => {
        throw err
      })

      request.params = { premisesId, roomId: room.id }
      request.body = {
        name: room.name,
      }

      await requestHandler(request, response, next)

      expect(insertEndDateErrors).toHaveBeenCalledWith(err, premisesId, room.id)
      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        err,
        paths.premises.bedspaces.edit({ premisesId, roomId: room.id }),
      )
    })

    describe('when a new bedspace name is supplied', () => {
      it('updates the room and redirects to the show page', async () => {
        const requestHandler = bedspacesController.update()

        const premises = premisesFactory.build({ status: 'active' })
        const room = roomFactory.build({ name: 'old-room-name' })
        const newRoom = newRoomFactory.build({ ...room, name: 'new-room-name' })

        request.params = { premisesId: premises.id, roomId: room.id }
        request.body = {
          name: newRoom.name,
          notes: newRoom.notes,
        }

        premisesService.getPremises.mockResolvedValue(premises)
        bedspaceService.updateRoom.mockResolvedValue(room)

        await requestHandler(request, response, next)

        expect(premisesService.getPremises).toHaveBeenCalledWith(callConfig, premises.id)
        expect(bedspaceService.updateRoom).toHaveBeenCalledWith(callConfig, premises.id, room.id, {
          name: newRoom.name,
          notes: newRoom.notes,
          characteristicIds: [],
        })

        expect(request.flash).toHaveBeenCalledWith('success', 'Bedspace updated')
        expect(response.redirect).toHaveBeenCalledWith(
          paths.premises.bedspaces.show({ premisesId: premises.id, roomId: room.id }),
        )
      })
    })

    describe('when the existing bedspace name is supplied', () => {
      it('updates the room and redirects to the show page', async () => {
        const requestHandler = bedspacesController.update()

        const premises = premisesFactory.build({ status: 'active' })
        const room = roomFactory.build({ name: 'old-room-name' })
        const newRoom = newRoomFactory.build({ ...room, name: 'old-room-name' })

        request.params = { premisesId: premises.id, roomId: room.id }
        request.body = {
          name: null,
          notes: newRoom.notes,
        }

        premisesService.getPremises.mockResolvedValue(premises)
        bedspaceService.updateRoom.mockResolvedValue(room)

        await requestHandler(request, response, next)

        expect(premisesService.getPremises).toHaveBeenCalledWith(callConfig, premises.id)
        expect(bedspaceService.updateRoom).toHaveBeenCalledWith(callConfig, premises.id, room.id, {
          name: null,
          notes: newRoom.notes,
          characteristicIds: [],
        })

        expect(request.flash).toHaveBeenCalledWith('success', 'Bedspace updated')
        expect(response.redirect).toHaveBeenCalledWith(
          paths.premises.bedspaces.show({ premisesId: premises.id, roomId: room.id }),
        )
      })
    })
  })

  describe('show', () => {
    it('returns the bedspace details to the template', async () => {
      const premises = premisesFactory.build({
        characteristics: [
          characteristicFactory.build({ name: 'b test characteristic' }),
          characteristicFactory.build({ name: 'a test characteristic' }),
        ],
      })
      const room = roomFactory.build()

      premisesService.getPremises.mockResolvedValue(premises)

      const bedspaceDetails = { room, summaryList: { rows: [] as Array<SummaryListItem> } }
      bedspaceService.getSingleBedspaceDetails.mockResolvedValue(bedspaceDetails)

      const listingEntries: Array<ListingEntry> = []
      bookingService.getListingEntries.mockResolvedValue([])
      ;(bedspaceActions as jest.MockedFunction<typeof bedspaceActions>).mockReturnValue([])

      request.params = { premisesId: premises.id, roomId: room.id }

      const requestHandler = bedspacesController.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/bedspaces/show', {
        premises,
        premisesCharacteristics: ['a test characteristic', 'b test characteristic'],
        bedspace: bedspaceDetails,
        listingEntries,
        actions: [],
      })

      expect(premisesService.getPremises).toHaveBeenCalledWith(callConfig, premises.id)
      expect(bedspaceService.getSingleBedspaceDetails).toHaveBeenCalledWith(callConfig, premises.id, room.id)
      expect(bookingService.getListingEntries).toHaveBeenCalledWith(callConfig, premises.id, room.id)
      expect(preservePlaceContext).toHaveBeenCalledWith(request, response, assessmentService)
    })
  })
})
