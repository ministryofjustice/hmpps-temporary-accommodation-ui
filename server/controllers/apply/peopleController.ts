import type { Request, RequestHandler, Response } from 'express'

import PersonService from '../../services/personService'
import extractCallConfig from '../../utils/restUtils'
import { errorMessage, errorSummary } from '../../utils/validation'

export default class PeopleController {
  constructor(private readonly personService: PersonService) {}

  find(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { crn } = req.body

      if (crn) {
        try {
          const callConfig = extractCallConfig(req)
          const person = await this.personService.findByCrn(callConfig, crn)
          req.flash('crn', person.crn)
        } catch (err) {
          if ('data' in err && err.status === 404) {
            this.addErrorMessagesToFlash(req, `No person with an CRN of '${crn}' was found`)
          } else {
            throw err
          }
        }
      } else {
        this.addErrorMessagesToFlash(req, 'You must enter a CRN')
      }
      res.redirect(req.headers.referer)
    }
  }

  addErrorMessagesToFlash(request: Request, message: string) {
    request.flash('errors', {
      crn: errorMessage('crn', message),
    })
    request.flash('errorSummary', [errorSummary('crn', message)])
    request.flash('userInput', request.body)
  }
}
