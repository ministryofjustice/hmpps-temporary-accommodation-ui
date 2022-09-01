import type { Request, Response, RequestHandler } from 'express'

import PersonService from '../services/personService'
import { catchValidationErrorOrPropogate } from '../utils/validation'

export default class PeopleController {
  constructor(private readonly personService: PersonService) {}

  find(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { crn } = req.body

      try {
        const person = await this.personService.findByCrn(req.user.token, crn)
        req.flash('crn', person.crn)
        res.redirect(req.headers.referer)
      } catch (err) {
        catchValidationErrorOrPropogate(req, res, err, req.headers.referer)
      }
    }
  }
}
