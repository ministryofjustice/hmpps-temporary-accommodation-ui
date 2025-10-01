import type { Request, RequestHandler, Response } from 'express'

import paths from '../../paths/apply'
import { PersonService } from '../../services'
import ApplicationService from '../../services/applicationService'
import TasklistService from '../../services/tasklistService'
import { firstPageOfApplicationJourney, getResponses } from '../../utils/applicationUtils'
import { DateFormats } from '../../utils/dateUtils'
import extractCallConfig from '../../utils/restUtils'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput, insertGenericError } from '../../utils/validation'
import TimelineService from '../../services/assessments/timelineService'

export default class ApplicationsController {
  constructor(
    private readonly applicationService: ApplicationService,
    private readonly timelineService: TimelineService,
    private readonly personService: PersonService,
  ) {}

  index(): RequestHandler {
    return async (req: Request, res: Response) => {
      const callConfig = extractCallConfig(req)
      const applications = await this.applicationService.getAllForLoggedInUser(callConfig)

      res.render('applications/index', { applications })
    }
  }

  start(): RequestHandler {
    return (_req: Request, res: Response) => {
      res.render('applications/start')
    }
  }

  show(): RequestHandler {
    return async (req: Request, res: Response) => {
      const callConfig = extractCallConfig(req)
      const application = await this.applicationService.getApplicationFromSessionOrAPI(callConfig, req)
      const taskList = new TasklistService(application)

      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)

      res.render('applications/show', {
        application,
        taskList,
        errors,
        errorSummary,
        ...userInput,
      })
    }
  }

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const callConfig = extractCallConfig(req)
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)

      const crnArr = req.flash('crn')

      if (crnArr.length) {
        const crn = crnArr[0] as string
        const person = await this.personService.findByCrn(callConfig, crn)

        try {
          const offences = await this.personService.getOffences(callConfig, crn)

          const offenceId = offences.length === 1 ? offences[0].offenceId : null

          return res.render(`applications/people/confirm`, {
            person,
            date: DateFormats.dateObjtoUIDate(new Date()),
            crn,
            offenceId,
            errors,
            errorSummary,
            ...userInput,
          })
        } catch (e) {
          if (e?.data?.status === 404) {
            return res.render('applications/people/missingNoms')
          }

          throw e
        }
      }

      return res.render('applications/new', {
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

      const { id } = req.params
      const application = await this.applicationService.findApplication(callConfig, id)
      application.document = getResponses(application)

      try {
        if (req.body?.confirmation !== 'submit') {
          throw new Error()
        }

        await this.applicationService.submit(callConfig, application)
        res.redirect(paths.applications.confirm({ id }))
      } catch (err) {
        insertGenericError(err, 'confirmation', 'invalid')
        catchValidationErrorOrPropogate(req, res, err, paths.applications.show({ id }), 'application')
      }
    }
  }

  confirm(): RequestHandler {
    return async (_: Request, res: Response) => {
      return res.render('applications/confirm')
    }
  }

  full(): RequestHandler {
    return async (req: Request, res: Response) => {
      const callConfig = extractCallConfig(req)

      const { id } = req.params
      const application = await this.applicationService.findApplication(callConfig, id)

      const timelineEvents = await this.timelineService.getTimelineForAssessment(callConfig, application.assessmentId)

      return res.render('applications/full', {
        application,
        timelineEvents,
      })
    }
  }
}
