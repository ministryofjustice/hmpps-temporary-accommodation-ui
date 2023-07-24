import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import { CallConfig } from '../../../data/restClient'
import { AssessmentsService } from '../../../services'
import { assessmentFactory, probationRegionFactory } from '../../../testutils/factories'
import extractCallConfig from '../../../utils/restUtils'
import AssessmentsController, { assessmentsTableHeaders } from './assessmentsController'
import { assessmentActions } from '../../../utils/assessmentUtils'

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

  describe('show', () => {
    it('shows a readonly view of an application', async () => {
      const assessmentId = 'some-assessment-id'
      const assessment = assessmentFactory.build({ id: assessmentId })
      assessmentsService.findAssessment.mockResolvedValue(assessment)
      request.params = { id: assessmentId }

      const requestHandler = assessmentsController.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/assessments/show', {
        assessment,
        actions: assessmentActions(assessment),
      })
      expect(assessmentsService.findAssessment).toHaveBeenCalledWith(callConfig, assessmentId)
    })
  })
})
