import type { Request, Response, RequestHandler } from 'express'

import type { NewPremises, UpdatePremises } from '@approved-premises/api'
import paths from '../../../paths/temporary-accommodation/manage'
import PremisesService from '../../../services/premisesService'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../../utils/validation'
import LocalAuthorityService from '../../../services/temporary-accommodation/localAuthorityService'
import BedspaceService from '../../../services/bedspaceService'

export default class PremisesController {
  constructor(
    private readonly premisesService: PremisesService,
    private readonly bedspaceService: BedspaceService,
    private readonly localAuthorityService: LocalAuthorityService,
  ) {}

  index(): RequestHandler {
    return async (req: Request, res: Response) => {
      const tableRows = await this.premisesService.temporaryAccommodationTableRows(req.user.token)
      return res.render('temporary-accommodation/premises/index', { tableRows })
    }
  }

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)

      const { token } = req.user

      const allLocalAuthorities = await this.localAuthorityService.getLocalAuthorities(token)
      const allCharacteristics = await this.premisesService.getPremisesCharacteristics(token)

      return res.render('temporary-accommodation/premises/new', {
        allLocalAuthorities,
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
      const newPremises: NewPremises = {
        characteristicIds: [],
        ...req.body,
        status: 'active',
      }

      try {
        const { id: premisesId } = await this.premisesService.create(req.user.token, newPremises)

        req.flash('success', 'Property created')
        res.redirect(paths.premises.show({ premisesId }))
      } catch (err) {
        catchValidationErrorOrPropogate(req, res, err, paths.premises.new({}))
      }
    }
  }

  edit(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)

      const { premisesId } = req.params
      const { token } = req.user

      const allLocalAuthorities = await this.localAuthorityService.getLocalAuthorities(token)
      const allCharacteristics = await this.premisesService.getPremisesCharacteristics(token)

      const updatePremises = await this.premisesService.getUpdatePremises(token, premisesId)

      return res.render('temporary-accommodation/premises/edit', {
        allLocalAuthorities,
        allCharacteristics,
        characteristicIds: [],
        errors,
        errorSummary,
        ...updatePremises,
        ...userInput,
      })
    }
  }

  update(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId } = req.params
      const { token } = req.user

      const updatePremises: UpdatePremises = {
        characteristicIds: [],
        ...req.body,
        status: 'active',
      }

      try {
        await this.premisesService.update(token, premisesId, updatePremises)

        req.flash('success', 'Property updated')
        res.redirect(paths.premises.show({ premisesId }))
      } catch (err) {
        catchValidationErrorOrPropogate(req, res, err, paths.premises.edit({ premisesId }))
      }
    }
  }

  show(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { token } = req.user
      const { premisesId } = req.params

      const details = await this.premisesService.getTemporaryAccommodationPremisesDetails(token, premisesId)

      const bedspaceDetails = await this.bedspaceService.getBedspaceDetails(token, premisesId)

      return res.render('temporary-accommodation/premises/show', {
        ...details,
        bedspaces: bedspaceDetails,
      })
    }
  }
}
