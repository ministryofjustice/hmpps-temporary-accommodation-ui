import type { Request, RequestHandler, Response } from 'express'

import { PersonService } from '../../../services'
import extractCallConfig from '../../../utils/restUtils'

export default class DocumentsController {
  constructor(private readonly personService: PersonService) {}

  show(): RequestHandler {
    return async (req: Request, res: Response) => {
      const callConfig = extractCallConfig(req)
      const { crn, documentId } = req.params
      return this.personService.getDocument(callConfig, crn, documentId, res)
    }
  }
}
