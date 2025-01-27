import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import { applicationFactory } from '../../../testutils/factories'
import { catchValidationErrorOrPropogate, insertGenericError } from '../../../utils/validation'
import DeleteController from './deleteController'
import { ApplicationService } from '../../../services'
import { CallConfig } from '../../../data/restClient'
import paths from '../../../paths/apply'
import extractCallConfig from '../../../utils/restUtils'
import { fullPersonFactory } from '../../../testutils/factories/person'

jest.mock('../../../utils/validation')
jest.mock('../../../utils/restUtils')

describe('DeleteController', () => {
  const callConfig = { token: 'some-call-config-token' } as CallConfig

  let request: DeepMocked<Request> = createMock<Request>()
  let response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = jest.fn()

  const applicationService = createMock<ApplicationService>({})

  let deleteController: DeleteController

  beforeEach(() => {
    deleteController = new DeleteController(applicationService)
    request = createMock<Request>({ flash: jest.fn() })
    response = createMock<Response>({})
    ;(extractCallConfig as jest.MockedFn<typeof extractCallConfig>).mockReturnValue(callConfig)
  })

  describe('delete', () => {
    it('deletes the application, sets flash message, and redirects back to dashboard', async () => {
      request.body = { confirmDelete: 'yes' }
      const inProgressApplication = applicationFactory.build()
      applicationService.findApplication.mockResolvedValue(inProgressApplication)
      applicationService.deleteApplication.mockResolvedValue(null)

      const requestHandler = deleteController.delete()

      await requestHandler(request, response, next)

      expect(request.flash).toHaveBeenCalledWith('success', 'You have deleted the referral')
      expect(response.redirect).toHaveBeenCalledWith(paths.applications.index({}))
    })

    it('redirects back to the application when user selects no', async () => {
      request.body = { confirmDelete: 'no' }
      const inProgressApplication = applicationFactory.build()
      applicationService.findApplication.mockResolvedValue(inProgressApplication)

      await deleteController.delete()(request, response, next)
      expect(response.redirect).toHaveBeenCalledWith(paths.applications.show({ id: inProgressApplication.id }))
    })

    it('shows an error when no option is selected', async () => {
      request.body = { confirmDelete: '' }
      const inProgressApplication = applicationFactory.build()
      applicationService.findApplication.mockResolvedValue(inProgressApplication)

      await deleteController.delete()(request, response, next)

      expect(response.render).toHaveBeenCalledWith('applications/delete', {
        application: inProgressApplication,
        errorSummary: [{ href: '#confirmDelete', text: 'Please select an option before proceeding' }],
        errors: { confirmDelete: 'Please select an option before proceeding' },
      })
    })

    it('shows appropriate errors if the delete is unsuccessful', async () => {
      request.params.id = 'some-id'
      request.body = { confirmDelete: 'yes' }
      const inProgressApplication = applicationFactory.build()
      applicationService.findApplication.mockResolvedValue(inProgressApplication)
      applicationService.deleteApplication.mockRejectedValue(new Error('Deletion failed'))

      await deleteController.delete()(request, response, next)

      expect(applicationService.deleteApplication).toHaveBeenCalledWith(callConfig, 'some-id')
      expect(insertGenericError).toHaveBeenCalledWith(expect.any(Error), 'delete', 'invalid')
      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        expect.any(Error),
        paths.applications.index({ id: 'some-id' }),
        'application',
      )
    })
  })

  describe('new', () => {
    it('shows the application confirm delete view', async () => {
      const person = fullPersonFactory.build()
      const inProgressApplication = applicationFactory.build({ person })
      applicationService.findApplication.mockResolvedValue(inProgressApplication)

      const requestHandler = deleteController.new()

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('applications/delete', {
        application: inProgressApplication,
      })
    })
  })
})
