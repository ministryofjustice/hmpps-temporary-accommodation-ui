import type { Request, Response, RequestHandler } from 'express'

import type { NewRoom } from '@approved-premises/api'
import paths from '../../../paths/temporary-accommodation/manage'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../../utils/validation'
import BedspaceService from '../../../services/bedspaceService'

export default class BedspacesController {
  constructor(private readonly bedspaceService: BedspaceService) {}

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
        await this.bedspaceService.createRoom(req.user.token, premisesId, newRoom)

        req.flash('success', 'Bedspace created')
        res.redirect(paths.premises.show({ premisesId }))
      } catch (err) {
        catchValidationErrorOrPropogate(req, res, err, paths.premises.bedspaces.new({ premisesId }))
      }
    }
  }
}
