import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import type { TemporaryAccommodationApplication } from '@approved-premises/api'
import type { ErrorsAndUserInput, GroupedApplications } from '@approved-premises/ui'
import Apply from '../../form-pages/apply'
import { ApplicationService, PersonService } from '../../services'
import TasklistService from '../../services/tasklistService'
import { activeOffenceFactory, applicationFactory, personFactory } from '../../testutils/factories'
import { fetchErrorsAndUserInput } from '../../utils/validation'
import ApplicationsController from './applicationsController'

import { CallConfig } from '../../data/restClient'
import paths from '../../paths/apply'
import { firstPageOfApplicationJourney, getResponses, isUnapplicable } from '../../utils/applicationUtils'
import { DateFormats } from '../../utils/dateUtils'
import extractCallConfig from '../../utils/restUtils'

jest.mock('../../utils/validation')
jest.mock('../../utils/applicationUtils')
jest.mock('../../services/tasklistService')
jest.mock('../../utils/restUtils')

describe('applicationsController', () => {
  const callConfig = { token: 'some-call-config-token' } as CallConfig

  let request: DeepMocked<Request> = createMock<Request>()
  let response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = jest.fn()

  const applicationService = createMock<ApplicationService>({})
  const personService = createMock<PersonService>({})

  let applicationsController: ApplicationsController

  beforeEach(() => {
    applicationsController = new ApplicationsController(applicationService, personService)
    request = createMock<Request>()
    response = createMock<Response>({})
    ;(extractCallConfig as jest.MockedFn<typeof extractCallConfig>).mockReturnValue(callConfig)
  })

  describe('index', () => {
    it('renders the index view', async () => {
      const applications: GroupedApplications = { inProgress: [], submitted: [] }

      applicationService.getAllForLoggedInUser.mockResolvedValue(applications)

      const requestHandler = applicationsController.index()

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('applications/index', {
        applications,
      })
      expect(applicationService.getAllForLoggedInUser).toHaveBeenCalled()
    })
  })

  describe('start', () => {
    it('renders the start page', () => {
      const requestHandler = applicationsController.start()

      requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('applications/start')
    })
  })

  describe('show', () => {
    const application = createMock<TemporaryAccommodationApplication>({ person: { crn: 'some-crn' } })

    beforeEach(() => {
      request = createMock<Request>({
        params: { id: application.id },
      })
    })

    it('fetches the application from session or the API and renders the task list', async () => {
      const requestHandler = applicationsController.show()
      const stubTaskList = jest.fn()

      applicationService.getApplicationFromSessionOrAPI.mockResolvedValue(application)
      ;(TasklistService as jest.Mock).mockImplementation(() => {
        return stubTaskList
      })

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('applications/show', {
        application,
        taskList: stubTaskList,
      })

      expect(applicationService.findApplication).not.toHaveBeenCalledWith(callConfig, application.id)
    })

    it('renders the not applicable page if the application is not applicable', async () => {
      const requestHandler = applicationsController.show()
      ;(isUnapplicable as jest.Mock).mockReturnValue(true)

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('applications/notEligible')
    })
  })

  describe('new', () => {
    describe('If there is a CRN in the flash', () => {
      const person = personFactory.build()
      const offence = activeOffenceFactory.build()

      beforeEach(() => {
        request = createMock<Request>({
          flash: jest.fn().mockReturnValue([person.crn]),
        })
        personService.findByCrn.mockResolvedValue(person)
        personService.getOffences.mockResolvedValue([offence])
      })

      describe('if an error has not been sent to the flash', () => {
        beforeEach(() => {
          ;(fetchErrorsAndUserInput as jest.Mock).mockImplementation(() => {
            return { errors: {}, errorSummary: [], userInput: {} }
          })
        })

        it('it should render the start of the application form', async () => {
          const requestHandler = applicationsController.new()

          await requestHandler(request, response, next)

          expect(response.render).toHaveBeenCalledWith('applications/people/confirm', {
            ...person,
            date: DateFormats.dateObjtoUIDate(new Date()),
            dateOfBirth: DateFormats.isoDateToUIDate(person.dateOfBirth, { format: 'short' }),
            offenceId: offence.offenceId,
            errors: {},
            errorSummary: [],
          })
          expect(personService.findByCrn).toHaveBeenCalledWith(callConfig, person.crn)
          expect(request.flash).toHaveBeenCalledWith('crn')
        })

        it('should not send an offence ID to the view if there are more than one offences returned', async () => {
          const offences = activeOffenceFactory.buildList(2)
          personService.getOffences.mockResolvedValue(offences)

          const requestHandler = applicationsController.new()
          await requestHandler(request, response, next)

          expect(response.render).toHaveBeenCalledWith('applications/people/confirm', {
            ...person,
            date: DateFormats.dateObjtoUIDate(new Date()),
            dateOfBirth: DateFormats.isoDateToUIDate(person.dateOfBirth, { format: 'short' }),
            offenceId: null,
            errors: {},
            errorSummary: [],
          })
        })
      })

      it('renders the form with errors and user input if an error has been sent to the flash', async () => {
        personService.findByCrn.mockResolvedValue(person)
        const errorsAndUserInput = createMock<ErrorsAndUserInput>()
        ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue(errorsAndUserInput)

        const requestHandler = applicationsController.new()

        await requestHandler(request, response, next)

        expect(response.render).toHaveBeenCalledWith('applications/people/confirm', {
          ...person,
          date: DateFormats.dateObjtoUIDate(new Date()),
          dateOfBirth: DateFormats.isoDateToUIDate(person.dateOfBirth, { format: 'short' }),
          offenceId: offence.offenceId,
          errors: errorsAndUserInput.errors,
          errorSummary: errorsAndUserInput.errorSummary,
          ...errorsAndUserInput.userInput,
        })
        expect(request.flash).toHaveBeenCalledWith('crn')
      })
    })

    describe('if there isnt a CRN present in the flash', () => {
      beforeEach(() => {
        request = createMock<Request>({
          flash: jest.fn().mockReturnValue([]),
        })
      })

      it('renders the CRN lookup page', async () => {
        ;(fetchErrorsAndUserInput as jest.Mock).mockImplementation(() => {
          return { errors: {}, errorSummary: [], userInput: {} }
        })

        const requestHandler = applicationsController.new()

        await requestHandler(request, response, next)

        expect(response.render).toHaveBeenCalledWith('applications/new', {
          errors: {},
          errorSummary: [],
        })
      })
      it('renders the form with errors and user input if an error has been sent to the flash', async () => {
        const errorsAndUserInput = createMock<ErrorsAndUserInput>()
        ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue(errorsAndUserInput)

        const requestHandler = applicationsController.new()

        await requestHandler(request, response, next)

        expect(response.render).toHaveBeenCalledWith('applications/new', {
          errors: errorsAndUserInput.errors,
          errorSummary: errorsAndUserInput.errorSummary,
          ...errorsAndUserInput.userInput,
        })
      })
    })
  })

  describe('create', () => {
    const application = applicationFactory.build()
    const offences = activeOffenceFactory.buildList(2)

    beforeEach(() => {
      request = createMock<Request>()
      request.body.crn = 'some-crn'
      request.body.offenceId = offences[0].offenceId

      personService.getOffences.mockResolvedValue(offences)
      applicationService.createApplication.mockResolvedValue(application)
    })

    it('creates an application and redirects to the first page of the first step', async () => {
      const firstPage = '/foo/bar'
      ;(firstPageOfApplicationJourney as jest.Mock).mockReturnValue(firstPage)

      const requestHandler = applicationsController.create()

      await requestHandler(request, response, next)

      expect(applicationService.createApplication).toHaveBeenCalledWith(callConfig, 'some-crn', offences[0])
      expect(firstPageOfApplicationJourney).toHaveBeenCalledWith(application)
      expect(response.redirect).toHaveBeenCalledWith(firstPage)
    })

    it('redirects to the select offences step if an offence has not been provided', async () => {
      request.body.offenceId = null

      const requestHandler = applicationsController.create()

      await requestHandler(request, response, next)

      expect(response.redirect).toHaveBeenCalledWith(
        paths.applications.people.selectOffence({
          crn: request.body.crn,
        }),
      )
    })

    it('saves the application to the session', async () => {
      const requestHandler = applicationsController.create()

      await requestHandler(request, response, next)

      expect(request.session.application).toEqual(application)
    })
  })

  describe('submit', () => {
    it('calls the application service with the application id if the checkbox is ticked', async () => {
      const application = applicationFactory.build()
      application.data = { 'basic-information': { 'sentence-type': '' } }
      applicationService.findApplication.mockResolvedValue(application)

      const requestHandler = applicationsController.submit()

      request.params.id = 'some-id'
      request.body.confirmation = 'submit'

      await requestHandler(request, response, next)

      expect(applicationService.findApplication).toHaveBeenCalledWith(callConfig, 'some-id')
      expect(getResponses).toHaveBeenCalledWith(application)
      expect(applicationService.submit).toHaveBeenCalledWith(callConfig, application)
      expect(response.render).toHaveBeenCalledWith('applications/confirm', {
        pageHeading: 'Application confirmation',
      })
    })

    it('renders the "show" view with errors if the checkbox isnt ticked ', async () => {
      const application = applicationFactory.build()
      request.params.id = 'some-id'
      request.body.confirmation = 'some-id'
      applicationService.findApplication.mockResolvedValue(application)

      const requestHandler = applicationsController.submit()

      await requestHandler(request, response, next)

      expect(applicationService.findApplication).toHaveBeenCalledWith(callConfig, request)
      expect(response.render).toHaveBeenCalledWith('applications/show', {
        application,
        errorObject: {
          text: 'You must confirm the information provided is complete, accurate and up to date.',
        },
        errorSummary: [
          {
            href: '#confirmation',
            text: 'You must confirm the information provided is complete, accurate and up to date.',
          },
        ],
        sections: Apply.sections,
      })
    })
  })
})
