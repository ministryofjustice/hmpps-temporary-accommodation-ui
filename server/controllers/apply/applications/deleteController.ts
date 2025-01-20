import type { Request, RequestHandler, Response } from 'express'

import paths from '../../../paths/apply'
import ApplicationService from '../../../services/applicationService'
import extractCallConfig from '../../../utils/restUtils'
import { catchValidationErrorOrPropogate, insertGenericError } from '../../../utils/validation'

export default class DeleteController {
  constructor(private readonly applicationService: ApplicationService) {}

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { id } = req.params
      const callConfig = extractCallConfig(req)

      const application = await this.applicationService.findApplication(callConfig, id)

      return res.render('applications/delete', { application })
    }
  }

  delete(): RequestHandler {
    return async (req: Request, res: Response) => {
      const callConfig = extractCallConfig(req)
      const { confirmDelete } = req.body
      const { id } = req.params
      const application = await this.applicationService.findApplication(callConfig, id)

      if (!confirmDelete) {
        return res.render('applications/delete', {
          errors: { confirmDelete: 'Please select an option before proceeding' },
          errorSummary: [{ text: 'Please select an option before proceeding', href: '#confirmDelete' }],
          application,
        })
      }

      if (confirmDelete === 'yes') {
        try {
          await this.applicationService.deleteApplication(callConfig, id)
          req.flash('success', `You have deleted the referral`)
          return res.redirect(paths.applications.index({}))
        } catch (err) {
          insertGenericError(err, 'delete', 'invalid')
          catchValidationErrorOrPropogate(req, res, err, paths.applications.index({ id }), 'application')
        }
      }

      return res.redirect(paths.applications.show({ id: application.id }))
    }
  }
}
