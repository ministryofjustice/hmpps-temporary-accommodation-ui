import type { Request, RequestHandler, Response } from 'express'

import { PersonService } from '../../../services'
import extractCallConfig from '../../../utils/restUtils'

export default class OffencesController {
  constructor(private readonly personService: PersonService) {}

  selectOffence(): RequestHandler {
    return async (req: Request, res: Response) => {
      const callConfig = extractCallConfig(req)
      const { crn } = req.params
      const person = await this.personService.findByCrn(callConfig, crn)
      const offences = await this.personService.getOffences(callConfig, crn)

      res.render('applications/people/selectOffence', {
        pageHeading: `Select index offence for ${person.name}`,
        person,
        offences,
      })
    }
  }
}
