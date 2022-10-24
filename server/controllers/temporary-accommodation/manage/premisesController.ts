import type { Request, Response, RequestHandler } from 'express'

import type { NewPremises } from '@approved-premises/api'
import paths from '../../../paths/temporary-accommodation/manage'
import PremisesService from '../../../services/premisesService'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../../utils/validation'
import LocalAuthorityService from '../../../services/temporary-accommodation/localAuthorityService'

export default class PremisesController {
  constructor(
    private readonly premisesService: PremisesService,
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

      const localAuthorities = await this.localAuthorityService.getLocalAuthorities(req.user.token)

      return res.render('temporary-accommodation/premises/new', {
        localAuthorities,
        errors,
        errorSummary,
        ...userInput,
      })
    }
  }

  create(): RequestHandler {
    return async (req: Request, res: Response) => {
      const newPremises: NewPremises = {
        ...req.body,
        service: 'temporary-accommodation',
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

  show(): RequestHandler {
    return async (req: Request, res: Response) => {
      const details = await this.premisesService.getTemporaryAccommodationPremisesDetails(
        req.user.token,
        req.params.premisesId,
      )

      return res.render('temporary-accommodation/premises/show', {
        ...details,
      })
    }
  }
}
