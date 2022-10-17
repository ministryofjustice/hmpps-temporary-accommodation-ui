import type { Request, Response, RequestHandler } from 'express'

import type { NewPremises } from '@approved-premises/ui'
import paths from '../../../paths/temporary-accommodation/manage'
import PremisesService from '../../../services/premisesService'
import { catchValidationErrorOrPropogate } from '../../../utils/validation'

export default class PremisesController {
  constructor(private readonly premisesService: PremisesService) {}

  index(): RequestHandler {
    return async (req: Request, res: Response) => {
      const tableRows = await this.premisesService.tableRows(req.user.token, 'temporary-accommodation')
      return res.render('temporary-accommodation/premises/index', { tableRows })
    }
  }

  new(): RequestHandler {
    return async (_req: Request, res: Response) => {
      return res.render('temporary-accommodation/premises/new')
    }
  }

  create(): RequestHandler {
    return async (req: Request, res: Response) => {
      const newPremises: NewPremises = {
        ...req.body,
        bedCount: parseInt(req.body.bedCount, 10),
        service: 'temporary-accommodation',
      }

      try {
        await this.premisesService.create(req.user.token, newPremises)

        req.flash('success', 'Property created')
        res.redirect(paths.premises.new({}))
      } catch (err) {
        catchValidationErrorOrPropogate(req, res, err, paths.premises.new({}))
      }
    }
  }
}
