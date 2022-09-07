import type { Request, Response, RequestHandler } from 'express'
import ApplicationService from '../../services/applicationService'

export default class ApplicationsController {
  constructor(private readonly applicationService: ApplicationService) {}

  new(): RequestHandler {
    return (_req: Request, res: Response) => {
      res.render('applications/new', { pageHeading: 'Apply for an Approved Premises (AP) placement' })
    }
  }
}
