import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import { CallConfig } from '../../../data/restClient'
import paths from '../../../paths/temporary-accommodation/manage'
import { AssessmentsService } from '../../../services'
import { assessmentFactory, probationRegionFactory } from '../../../testutils/factories'
import { assessmentActions } from '../../../utils/assessmentUtils'
import extractCallConfig from '../../../utils/restUtils'
import AssessmentsController, { assessmentsTableHeaders, confirmationPageContent } from './assessmentsController'

jest.mock('../../../utils/restUtils')

describe('AssessmentsController', () => {
  const callConfig = { token: 'some-call-config-token' } as CallConfig

  let request: Request

  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const assessmentsService = createMock<AssessmentsService>({})
  const assessmentsController = new AssessmentsController(assessmentsService)

  beforeEach(() => {
    request = createMock<Request>({
      session: {
        probationRegion: probationRegionFactory.build(),
      },
    })
    ;(extractCallConfig as jest.MockedFn<typeof extractCallConfig>).mockReturnValue(callConfig)
  })

  describe('index', () => {
    it('returns the table rows to the template', async () => {
      assessmentsService.getAllForLoggedInUser.mockResolvedValue({
        unallocatedTableRows: [],
        inProgressTableRows: [],
        readyToPlaceTableRows: [],
        archivedTableRows: [],
      })

      const requestHandler = assessmentsController.index()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/assessments/index', {
        unallocatedTableRows: [],
        inProgressTableRows: [],
        readyToPlaceTableRows: [],
        tableHeaders: assessmentsTableHeaders,
      })

      expect(assessmentsService.getAllForLoggedInUser).toHaveBeenCalledWith(callConfig)
    })
  })

  describe('archive', () => {
    it('returns the table rows to the archived template', async () => {
      assessmentsService.getAllForLoggedInUser.mockResolvedValue({
        unallocatedTableRows: [],
        inProgressTableRows: [],
        readyToPlaceTableRows: [],
        archivedTableRows: [],
      })

      const requestHandler = assessmentsController.archive()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/assessments/archive', {
        archivedTableRows: [],
      })

      expect(assessmentsService.getAllForLoggedInUser).toHaveBeenCalledWith(callConfig)
    })
  })

  describe('summary', () => {
    it('shows a summary view of the assessment', async () => {
      const assessmentId = 'some-assessment-id'
      const assessment = assessmentFactory.build({ id: assessmentId })
      assessmentsService.findAssessment.mockResolvedValue(assessment)
      request.params = { id: assessmentId }

      const requestHandler = assessmentsController.summary()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/assessments/summary', {
        assessment,
        actions: assessmentActions(assessment),
      })
      expect(assessmentsService.findAssessment).toHaveBeenCalledWith(callConfig, assessmentId)
    })
  })

  describe('full', () => {
    it('shows a readonly view of an application', async () => {
      const assessmentId = 'some-assessment-id'
      const assessment = assessmentFactory.build({ id: assessmentId })
      assessmentsService.findAssessment.mockResolvedValue(assessment)
      request.params = { id: assessmentId }

      const requestHandler = assessmentsController.full()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/assessments/full', {
        assessment,
        actions: assessmentActions(assessment),
      })
      expect(assessmentsService.findAssessment).toHaveBeenCalledWith(callConfig, assessmentId)
    })
  })

  describe('confirm', () => {
    it.each([
      'null' as const,
      'unallocated' as const,
      'in_review' as const,
      'ready_to_place' as const,
      'closed' as const,
      'rejected' as const,
    ])('calls render with a confirmation message for the %s status', async status => {
      const assessmentId = 'some-assessment-id'
      const requestHandler = assessmentsController.confirm()
      request.params = { id: assessmentId, status }
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/assessments/confirm', {
        content: confirmationPageContent[status],
        status,
        id: assessmentId,
      })
    })
  })

  describe('update', () => {
    it('calls the updateAssessmentStatus method on the service with the new status', async () => {
      const newStatus = 'in_review'
      const assessmentId = 'some-id'

      const requestHandler = assessmentsController.update()
      request.params = { id: assessmentId, status: newStatus }

      await requestHandler(request, response, next)

      expect(assessmentsService.updateAssessmentStatus).toHaveBeenCalledWith(callConfig, assessmentId, newStatus)
      expect(response.redirect).toHaveBeenCalledWith(paths.assessments.summary({ id: assessmentId }))
    })
  })
})
