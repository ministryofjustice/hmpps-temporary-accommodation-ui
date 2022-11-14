import type { Request, Response, RequestHandler } from 'express'

import type { NewRoom, UpdateRoom } from '@approved-premises/api'
import paths from '../../../paths/temporary-accommodation/manage'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../../utils/validation'
import BedspaceService from '../../../services/bedspaceService'
import { PremisesService, BookingService } from '../../../services'

export default class BedspacesController {
  constructor(
    private readonly premisesService: PremisesService,
    private readonly bedspaceService: BedspaceService,
    private readonly bookingService: BookingService,
  ) {}

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)
      const { premisesId } = req.params

      const allCharacteristics = await this.bedspaceService.getRoomCharacteristics(req.user.token)

      return res.render('temporary-accommodation/bedspaces/new', {
        premisesId,
        allCharacteristics,
        characteristicIds: [],
        errors,
        errorSummary,
        ...userInput,
      })
    }
  }

  create(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId } = req.params

      const newRoom: NewRoom = {
        characteristicIds: [],
        ...req.body,
      }

      try {
        const room = await this.bedspaceService.createRoom(req.user.token, premisesId, newRoom)

        req.flash('success', 'Bedspace created')
        res.redirect(paths.premises.bedspaces.show({ premisesId, roomId: room.id }))
      } catch (err) {
        catchValidationErrorOrPropogate(req, res, err, paths.premises.bedspaces.new({ premisesId }))
      }
    }
  }

  edit(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)

      const { premisesId, roomId } = req.params
      const { token } = req.user

      const allCharacteristics = await this.bedspaceService.getRoomCharacteristics(token)

      const updateRoom = await this.bedspaceService.getUpdateRoom(token, premisesId, roomId)

      return res.render('temporary-accommodation/bedspaces/edit', {
        allCharacteristics,
        characteristicIds: [],
        premisesId,
        errors,
        errorSummary,
        ...updateRoom,
        ...userInput,
      })
    }
  }

  update(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, roomId } = req.params
      const { token } = req.user

      const updateRoom: UpdateRoom = {
        characteristicIds: [],
        ...req.body,
      }

      try {
        await this.bedspaceService.updateRoom(token, premisesId, roomId, updateRoom)

        req.flash('success', 'Bedspace updated')
        res.redirect(paths.premises.bedspaces.show({ premisesId, roomId }))
      } catch (err) {
        catchValidationErrorOrPropogate(req, res, err, paths.premises.bedspaces.edit({ premisesId, roomId }))
      }
    }
  }

  show(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { token } = req.user
      const { premisesId, roomId } = req.params

      const premises = await this.premisesService.getPremises(token, premisesId)
      const room = await this.bedspaceService.getRoom(token, premisesId, roomId)

      const bedspaceDetails = await this.bedspaceService.getSingleBedspaceDetails(token, premisesId, roomId)
      const bookingTableRows = await this.bookingService.getTableRowsForBedspace(token, premisesId, room)

      return res.render('temporary-accommodation/bedspaces/show', {
        premises,
        bedspace: bedspaceDetails,
        bookingTableRows,
      })
    }
  }
}
