import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import { AssessmentSearchApiStatus } from '@approved-premises/ui'
import { CallConfig } from '../../../data/restClient'
import paths from '../../../paths/temporary-accommodation/manage'
import { AssessmentsService } from '../../../services'
import {
  assessmentFactory,
  assessmentSummaryFactory,
  newReferralHistoryUserNoteFactory,
  probationRegionFactory,
} from '../../../testutils/factories'
import { assessmentActions, statusChangeMessage } from '../../../utils/assessmentUtils'
import { preservePlaceContext } from '../../../utils/placeUtils'
import extractCallConfig from '../../../utils/restUtils'
import { appendQueryString } from '../../../utils/utils'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../../utils/validation'
import AssessmentsController, { assessmentsTableHeaders, confirmationPageContent } from './assessmentsController'

jest.mock('../../../utils/assessmentUtils')
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

  const actions = [
    {
      text: 'Some action',
      href: '/some/action/path',
      classes: 'govuk-button--secondary',
    },
  ]

  beforeEach(() => {
    request = createMock<Request>({
      session: {
        probationRegion: probationRegionFactory.build(),
      },
    })
    ;(extractCallConfig as jest.MockedFn<typeof extractCallConfig>).mockReturnValue(callConfig)
  })

  describe('index', () => {
    it('redirects to unallocated referrals', async () => {
      const requestHandler = assessmentsController.index()
      await requestHandler(request, response, next)

      expect(response.redirect).toHaveBeenCalledWith(paths.assessments.unallocated.pattern)
    })
  })

  describe('list', () => {
    it.each(['unallocated', 'in_review', 'ready_to_place'])(
      'returns the table rows for assessments with status %s to the template',
      async (status: AssessmentSearchApiStatus) => {
        const assessments = assessmentSummaryFactory.buildList(5, { status })
        assessmentsService.getAllForLoggedInUser.mockResolvedValue(assessments)

        const requestHandler = assessmentsController.list(status)
        await requestHandler(request, response, next)

        expect(response.render).toHaveBeenCalledWith('temporary-accommodation/assessments/index', {
          status,
          tableRows: assessments,
          tableHeaders: assessmentsTableHeaders,
        })

        expect(assessmentsService.getAllForLoggedInUser).toHaveBeenCalledWith(callConfig, status)
      },
    )
  })

  describe('archive', () => {
    it('returns the table rows to the archived template', async () => {
      const assessments = assessmentSummaryFactory.buildList(5, { status: 'closed' })
      assessmentsService.getAllForLoggedInUser.mockResolvedValue(assessments)

      const requestHandler = assessmentsController.archive()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/assessments/archive', {
        archivedTableRows: assessments,
      })

      expect(assessmentsService.getAllForLoggedInUser).toHaveBeenCalledWith(callConfig, 'archived')
    })
  })

  describe('summary', () => {
    it('shows a summary view of the assessment', async () => {
      const assessmentId = 'some-assessment-id'
      const assessment = assessmentFactory.build({ id: assessmentId })
      assessmentsService.findAssessment.mockResolvedValue(assessment)
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({ errors: {}, errorSummary: [], userInput: {} })
      ;(assessmentActions as jest.MockedFunction<typeof assessmentActions>).mockReturnValue(actions)
      request.params = { id: assessmentId }

      const requestHandler = assessmentsController.summary()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/assessments/summary', {
        assessment,
        actions,
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
      ;(assessmentActions as jest.MockedFunction<typeof assessmentActions>).mockReturnValue(actions)
      request.params = { id: assessmentId }

      const requestHandler = assessmentsController.full()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/assessments/full', {
        assessment,
        actions,
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

      ;(statusChangeMessage as jest.MockedFunction<typeof statusChangeMessage>).mockReturnValue('some info message')

      const requestHandler = assessmentsController.update()
      request.params = { id: assessmentId, status: newStatus }

      await requestHandler(request, response, next)

      expect(assessmentsService.updateAssessmentStatus).toHaveBeenCalledWith(callConfig, assessmentId, newStatus)
      expect(statusChangeMessage).toHaveBeenCalledWith(assessmentId, newStatus)
      expect(response.redirect).toHaveBeenCalledWith(paths.assessments.summary({ id: assessmentId }))
      expect(request.flash).toHaveBeenCalledWith('success', 'some info message')
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
