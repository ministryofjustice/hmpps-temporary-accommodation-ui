import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import { CallConfig } from '../../../data/restClient'
import paths from '../../../paths/temporary-accommodation/manage'
import { AssessmentsService } from '../../../services'
import {
  assessmentFactory,
  newReferralHistoryUserNoteFactory,
  probationRegionFactory,
} from '../../../testutils/factories'
import { assessmentActions } from '../../../utils/assessmentUtils'
import { preservePlaceContext } from '../../../utils/placeUtils'
import extractCallConfig from '../../../utils/restUtils'
import { appendQueryString } from '../../../utils/utils'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../../utils/validation'
import AssessmentsController, { assessmentsTableHeaders, confirmationPageContent } from './assessmentsController'

jest.mock('../../../utils/restUtils')
jest.mock('../../../utils/validation')
jest.mock('../../../utils/utils')
jest.mock('../../../utils/placeUtils')

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
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({ errors: {}, errorSummary: [], userInput: {} })
      request.params = { id: assessmentId }

      const requestHandler = assessmentsController.summary()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/assessments/summary', {
        assessment,
        actions: assessmentActions(assessment),
        errors: {},
        errorSummary: [],
      })
      expect(assessmentsService.findAssessment).toHaveBeenCalledWith(callConfig, assessmentId)
      expect(preservePlaceContext).toHaveBeenCalledWith(request, response, assessmentsService)
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
      expect(preservePlaceContext).toHaveBeenCalledWith(request, response, assessmentsService)
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

  describe('createNote', () => {
    it('creates a new note and redirects to assessment summary page', async () => {
      const requestHandler = assessmentsController.createNote()
      const assessmentId = 'some-id'
      const newNote = newReferralHistoryUserNoteFactory.build()

      request.params = { id: assessmentId }
      request.body = { message: newNote.message }
      ;(appendQueryString as jest.MockedFunction<typeof appendQueryString>).mockReturnValue('/path/with/success/token')

      await requestHandler(request, response, next)

      expect(assessmentsService.createNote).toHaveBeenCalledWith(callConfig, assessmentId, newNote)
      expect(request.flash).toHaveBeenCalledWith('success', 'Note saved')
      expect(response.redirect).toHaveBeenCalledWith('/path/with/success/token')
      expect(appendQueryString).toHaveBeenCalledWith(paths.assessments.summary({ id: assessmentId }), {
        success: 'true',
      })
    })

    it('redirects to the assessment summary page with errors if the API returns an error', async () => {
      const requestHandler = assessmentsController.createNote()
      const assessmentId = 'some-id'
      const newNote = newReferralHistoryUserNoteFactory.build()

      const err = new Error()

      assessmentsService.createNote.mockRejectedValue(err)
      ;(appendQueryString as jest.MockedFunction<typeof appendQueryString>).mockReturnValue('/path/with/failure/token')

      request.params = { id: assessmentId }
      request.body = { message: newNote.message }

      await requestHandler(request, response, next)

      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(request, response, err, '/path/with/failure/token')
      expect(appendQueryString).toHaveBeenCalledWith(paths.assessments.summary({ id: assessmentId }), {
        success: 'false',
      })
    })
  })
})
