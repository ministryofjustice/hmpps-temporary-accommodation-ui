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
      return res.render('temporary-accommodation/premises/new', {
        localAuthorities: [
          {
            name: 'Aberdeen City',
            id: '0fb03403-17e8-4b3a-b283-122a18ed8929',
          },
          {
            name: 'Babergh',
            id: 'c2892a98-dea6-4a80-9c3e-bf4e5c42ee0a',
          },
          {
            name: 'Caerphilly',
            id: '69fbc53a-a930-4d9f-b218-4c9c6bf3de7b',
          },
          {
            name: 'Dacorum',
            id: 'bed5ff2d-ee34-4423-967c-4dc50f12843e',
          },
        ],
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
        await this.premisesService.create(req.user.token, newPremises)

        req.flash('success', 'Property created')
        res.redirect(paths.premises.new({}))
      } catch (err) {
        catchValidationErrorOrPropogate(req, res, err, paths.premises.new({}))
      }
    }
  }
}
