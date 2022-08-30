import type { Response, Request, RequestHandler } from 'express'

import type { NewLostBed } from 'approved-premises'
import LostBedService from '../services/lostBedService'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../utils/validation'
import { convertDateAndTimeInputsToIsoString } from '../utils/utils'

export default class LostBedsController {
  constructor(private readonly lostBedService: LostBedService) {}

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId } = req.params
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)

      const lostBedReasons = await this.lostBedService.getReferenceData(req.user.token)

      res.render('lostBeds/new', {
        premisesId,
        lostBedReasons,
        errors,
        errorSummary,
        ...userInput,
      })
    }
  }

  create(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId } = req.params

      const { startDate } = convertDateAndTimeInputsToIsoString(req.body, 'startDate')
      const { endDate } = convertDateAndTimeInputsToIsoString(req.body, 'endDate')

      const lostBed: NewLostBed = { ...req.body.lostBed, startDate, endDate }

      try {
        await this.lostBedService.createLostBed(req.user.token, premisesId, lostBed)

        req.flash('success', 'Lost bed logged')
        res.redirect(`/premises/${premisesId}`)
      } catch (err) {
        catchValidationErrorOrPropogate(req, res, err, `/premises/${premisesId}/lostBeds/new`)
      }
    }
  }
}
