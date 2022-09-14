import type { Request, Response, RequestHandler } from 'express'
import ApplicationService from '../../services/applicationService'
import paths from '../../paths/apply'

export default class ApplicationsController {
  constructor(private readonly applicationService: ApplicationService) {}

  index(): RequestHandler {
    return async (req: Request, res: Response) => {
      const applicationSummaries = await this.applicationService.tableRows(req.user.token)

      res.render('applications/list', { pageHeading: 'Approved Premises applications', applicationSummaries })
    }
  }

  start(): RequestHandler {
    return (_req: Request, res: Response) => {
      res.render('applications/start', {
        pageHeading: 'Apply for an Approved Premises (AP) placement',
      })
    }
  }
    }
  }

  create(): RequestHandler {
    return async (req: Request, res: Response) => {
      const uuid = await this.applicationService.createApplication(req.user.token)

      res.redirect(paths.applications.pages.show({ id: uuid, task: 'basic-information', page: 'enter-crn' }))
    }
  }
}
