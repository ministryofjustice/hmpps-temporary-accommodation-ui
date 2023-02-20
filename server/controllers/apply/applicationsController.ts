import type { Request, RequestHandler, Response } from 'express'

import TasklistService from '../../services/tasklistService'
import ApplicationService from '../../services/applicationService'
import { PersonService } from '../../services'
import { fetchErrorsAndUserInput } from '../../utils/validation'
import paths from '../../paths/apply'
import { DateFormats } from '../../utils/dateUtils'
import Apply from '../../form-pages/apply'
import { firstPageOfApplicationJourney, getResponses, isUnapplicable } from '../../utils/applicationUtils'
import extractCallConfig from '../../utils/restUtils'

export const tasklistPageHeading = 'Apply for an Approved Premises (AP) placement'

export default class ApplicationsController {
  constructor(private readonly applicationService: ApplicationService, private readonly personService: PersonService) {}

  index(): RequestHandler {
    return async (req: Request, res: Response) => {
      const callConfig = extractCallConfig(req)
      const applications = await this.applicationService.getAllForLoggedInUser(callConfig)

      res.render('applications/index', { pageHeading: 'Approved Premises applications', applications })
    }
  }

  start(): RequestHandler {
    return (_req: Request, res: Response) => {
      res.render('applications/start', {
        pageHeading: tasklistPageHeading,
      })
    }
  }

  show(): RequestHandler {
    return async (req: Request, res: Response) => {
      const callConfig = extractCallConfig(req)
      const application = await this.applicationService.getApplicationFromSessionOrAPI(callConfig, req)
      const taskList = new TasklistService(application)

      if (isUnapplicable(application)) {
        res.render('applications/notEligible')
      } else {
        res.render('applications/show', { application, taskList })
      }
    }
  }

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const callConfig = extractCallConfig(req)
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)

      const crnArr = req.flash('crn')

      if (crnArr.length) {
        const crn = crnArr[0]
        const person = await this.personService.findByCrn(callConfig, crn)
        const offences = await this.personService.getOffences(callConfig, crn)

        const offenceId = offences.length === 1 ? offences[0].offenceId : null

        return res.render(`applications/people/confirm`, {
          pageHeading: `Confirm ${person.name}'s details`,
          ...person,
          date: DateFormats.dateObjtoUIDate(new Date()),
          dateOfBirth: DateFormats.isoDateToUIDate(person.dateOfBirth, { format: 'short' }),
          offenceId,
          errors,
          errorSummary,
          ...userInput,
        })
      }

      return res.render('applications/new', {
        pageHeading: "Enter the person's CRN",
        errors,
        errorSummary,
        ...userInput,
      })
    }
  }

  create(): RequestHandler {
    return async (req: Request, res: Response) => {
      const callConfig = extractCallConfig(req)
      const { crn, offenceId } = req.body
      if (!offenceId) {
        res.redirect(paths.applications.people.selectOffence({ crn }))
      } else {
        const offences = await this.personService.getOffences(callConfig, crn)
        const indexOffence = offences.find(o => o.offenceId === offenceId)

        const application = await this.applicationService.createApplication(callConfig, crn, indexOffence)
        req.session.application = application

        res.redirect(firstPageOfApplicationJourney(application))
      }
    }
  }

  submit(): RequestHandler {
    return async (req: Request, res: Response) => {
      const callConfig = extractCallConfig(req)
      const application = await this.applicationService.findApplication(callConfig, req.params.id)
      application.document = getResponses(application)

      if (req.body?.confirmation !== 'submit') {
        const errorMessage = 'You must confirm the information provided is complete, accurate and up to date.'
        const errorObject = { text: errorMessage }

        return res.render('applications/show', {
          application,
          errorSummary: [
            {
              text: errorMessage,
              href: '#confirmation',
            },
          ],
          errorObject,
          pageHeading: tasklistPageHeading,
          sections: Apply.sections,
        })
      }

      await this.applicationService.submit(callConfig, application)
      return res.render('applications/confirm', { pageHeading: 'Application confirmation' })
    }
  }
}
