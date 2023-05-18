import type { Request, RequestHandler, Response } from 'express'

import type { NewRoom, UpdateRoom } from '@approved-premises/api'
import paths from '../../../paths/temporary-accommodation/manage'
import { BookingService, PremisesService } from '../../../services'
import BedspaceService from '../../../services/bedspaceService'
import { bedspaceActions } from '../../../utils/bedspaceUtils'
import extractCallConfig from '../../../utils/restUtils'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../../utils/validation'

export default class BedspacesController {
  constructor(
    private readonly premisesService: PremisesService,
    private readonly bedspaceService: BedspaceService,
    private readonly bookingService: BookingService,
  ) {}

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)

      const callConfig = extractCallConfig(req)
      const { premisesId } = req.params

      const { characteristics: allCharacteristics } = await this.bedspaceService.getReferenceData(callConfig)
      const premises = await this.premisesService.getPremises(callConfig, premisesId)

      return res.render('temporary-accommodation/bedspaces/new', {
        allCharacteristics,
        characteristicIds: [],
        premises,
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
        const callConfig = extractCallConfig(req)

        const room = await this.bedspaceService.createRoom(callConfig, premisesId, newRoom)

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
      const callConfig = extractCallConfig(req)

      const { characteristics: allCharacteristics } = await this.bedspaceService.getReferenceData(callConfig)
      const premises = await this.premisesService.getPremises(callConfig, premisesId)

      const updateRoom = await this.bedspaceService.getUpdateRoom(callConfig, premisesId, roomId)

      return res.render('temporary-accommodation/bedspaces/edit', {
        allCharacteristics,
        characteristicIds: [],
        premises,
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
      const callConfig = extractCallConfig(req)

      const updateRoom: UpdateRoom = {
        characteristicIds: [],
        ...req.body,
      }

      try {
        await this.bedspaceService.updateRoom(callConfig, premisesId, roomId, updateRoom)

        req.flash('success', 'Bedspace updated')
        res.redirect(paths.premises.bedspaces.show({ premisesId, roomId }))
      } catch (err) {
        catchValidationErrorOrPropogate(req, res, err, paths.premises.bedspaces.edit({ premisesId, roomId }))
      }
    }
  }

  show(): RequestHandler {
    return async (req: Request, res: Response) => {
      const callConfig = extractCallConfig(req)
      const { premisesId, roomId } = req.params

      const premises = await this.premisesService.getPremises(callConfig, premisesId)
      const premisesCharacteristics = premises.characteristics.map(item => item.name).sort((a, b) => a.localeCompare(b))
      const room = await this.bedspaceService.getRoom(callConfig, premisesId, roomId)

      const bedspaceDetails = await this.bedspaceService.getSingleBedspaceDetails(callConfig, premisesId, roomId)
      const listingEntries = await this.bookingService.getListingEntries(callConfig, premisesId, room)

      return res.render('temporary-accommodation/bedspaces/show', {
        premises,
        premisesCharacteristics,
        bedspace: bedspaceDetails,
        listingEntries,
        actions: bedspaceActions(premises, room),
      })
    }
  }
}
