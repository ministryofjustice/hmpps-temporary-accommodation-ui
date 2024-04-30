import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import { AssessmentSearchApiStatus } from '@approved-premises/ui'
import { ParsedQs } from 'qs'
import { CallConfig } from '../../../data/restClient'
import paths from '../../../paths/temporary-accommodation/manage'
import { AssessmentsService } from '../../../services'
import {
  assessmentFactory,
  assessmentSearchParametersFactory,
  assessmentSummaryFactory,
  newReferralHistoryUserNoteFactory,
  probationRegionFactory,
  referenceDataFactory,
} from '../../../testutils/factories'
import * as assessmentUtils from '../../../utils/assessmentUtils'
import { preservePlaceContext } from '../../../utils/placeUtils'
import extractCallConfig from '../../../utils/restUtils'
import * as utils from '../../../utils/utils'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput, insertGenericError } from '../../../utils/validation'
import AssessmentsController, {
  confirmationPageContent,
  referralRejectionReasonOtherMatch,
} from './assessmentsController'
import assessmentSummaries from '../../../testutils/factories/assessmentSummaries'
import { pathFromStatus } from '../../../utils/assessmentUtils'

jest.mock('../../../utils/restUtils')
jest.mock('../../../utils/validation')
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

  const session = {
    probationRegion: probationRegionFactory.build(),
  }

  const tableHeaders = [
    {
      html: '<a href="?sortBy=name"><button>Name</button></a>',
      attributes: {
        'aria-sort': 'none',
      },
    },
    {
      html: '<a href="?sortBy=crn"><button>CRN</button></a>',
      attributes: {
        'aria-sort': 'none',
      },
    },
    {
      html: '<a href="?sortBy=createdAt"><button>Referral received</button></a>',
      attributes: {
        'aria-sort': 'none',
      },
    },
    {
      html: '<a href="?sortBy=arrivedAt&sortDirection=desc"><button>Bedspace required</button></a>',
      attributes: {
        'aria-sort': 'ascending',
      },
    },
  ]

  beforeEach(() => {
    request = createMock<Request>({ session, query: {} })
    ;(extractCallConfig as jest.MockedFn<typeof extractCallConfig>).mockReturnValue(callConfig)
    ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({ errors: {}, errorSummary: [] })
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
  })

  describe('index', () => {
    it('redirects to unallocated referrals', async () => {
      const requestHandler = assessmentsController.index()
      await requestHandler(request, response, next)

      expect(response.redirect).toHaveBeenCalledWith(301, paths.assessments.unallocated.pattern)
    })
  })

  describe('list', () => {
    describe.each(['unallocated', 'in_review', 'ready_to_place', 'archived'])(
      'when viewing assessments with status %s',
      (status: AssessmentSearchApiStatus) => {
        let expectedTemplate = 'temporary-accommodation/assessments/index'
        let expectedHeaders = [...tableHeaders]
        const statusHeader = {
          html: '<a href="?sortBy=status"><button>Status</button></a>',
          attributes: {
            'aria-sort': 'none',
          },
        }

        beforeEach(() => {
          if (status === 'archived') {
            expectedTemplate = 'temporary-accommodation/assessments/archive'
            expectedHeaders.push(statusHeader)
          }
        })

        it('returns the pagination and table rows to the template', async () => {
          const assessment = assessmentSummaryFactory.build()
          const assessments = assessmentSummaries.build({ data: [assessment], totalResults: 1 })

          assessmentsService.getAllForLoggedInUser.mockResolvedValue({
            ...assessments,
            data: assessments.data.map(summary => [{ text: summary.createdAt }]),
          })

          const requestHandler = assessmentsController.list(status)
          await requestHandler(request, response, next)

          expect(response.render).toHaveBeenCalledWith(expectedTemplate, {
            status,
            basePath: pathFromStatus(status),
            tableRows: [[{ text: assessment.createdAt }]],
            tableHeaders: expectedHeaders,
            pagination: {},
            errors: {},
          })

          expect(assessmentsService.getAllForLoggedInUser).toHaveBeenCalledWith(callConfig, status, {
            page: 1,
            sortBy: 'arrivedAt',
            sortDirection: 'asc',
          })
        })

        it('returns the correct page and sorted assessments to the template', async () => {
          request = createMock<Request>({ session, query: { page: '2', sortBy: 'createdAt', sortDirection: 'desc' } })
          const assessments = assessmentSummaries.build({
            totalResults: 13,
            pageNumber: 2,
            totalPages: 2,
          })
          assessmentsService.getAllForLoggedInUser.mockResolvedValue(assessments)

          expectedHeaders = [
            tableHeaders[0],
            tableHeaders[1],
            {
              html: '<a href="?sortBy=createdAt&sortDirection=asc"><button>Referral received</button></a>',
              attributes: {
                'aria-sort': 'descending',
              },
            },
            {
              html: '<a href="?sortBy=arrivedAt"><button>Bedspace required</button></a>',
              attributes: {
                'aria-sort': 'none',
              },
            },
          ]

          if (status === 'archived') {
            expectedHeaders.push(statusHeader)
          }

          const requestHandler = assessmentsController.list(status)
          await requestHandler(request, response, next)

          expect(response.render).toHaveBeenLastCalledWith(expectedTemplate, {
            status,
            basePath: pathFromStatus(status),
            tableHeaders: expectedHeaders,
            tableRows: assessments.data,
            pagination: {
              items: [
                { text: '1', href: '?page=1&sortBy=createdAt&sortDirection=desc' },
                { text: '2', href: '?page=2&sortBy=createdAt&sortDirection=desc', selected: true },
              ],
              previous: { text: 'Previous', href: '?page=1&sortBy=createdAt&sortDirection=desc' },
            },
            errors: {},
          })

          expect(assessmentsService.getAllForLoggedInUser).toHaveBeenCalledWith(callConfig, status, {
            page: 2,
            sortBy: 'createdAt',
            sortDirection: 'desc',
          })
        })

        describe('when there is a CRN search parameter', () => {
          it('renders the filtered table view', async () => {
            const assessments = assessmentSummaries.build()
            const searchParameters = assessmentSearchParametersFactory.build()

            jest.spyOn(assessmentUtils, 'createTableHeadings').mockReturnValue([])
            assessmentsService.getAllForLoggedInUser.mockResolvedValue(assessments)
            request.query = searchParameters as ParsedQs

            const requestHandler = assessmentsController.list(status)
            await requestHandler(request, response, next)

            expect(assessmentsService.getAllForLoggedInUser).toHaveBeenCalledWith(callConfig, status, {
              crn: searchParameters.crn,
              page: 1,
              sortBy: 'arrivedAt',
              sortDirection: 'asc',
            })

            expect(response.render).toHaveBeenCalledWith(expectedTemplate, {
              status,
              basePath: pathFromStatus(status),
              tableRows: assessments.data,
              tableHeaders: [],
              pagination: {},
              crn: searchParameters.crn,
              errors: {},
            })
          })
        })

        describe('when a blank CRN search is submitted', () => {
          it('renders an error', async () => {
            const searchParameters = assessmentSearchParametersFactory.build({ crn: '  ' })

            request.query = searchParameters as ParsedQs

            const requestHandler = assessmentsController.list(status)
            await requestHandler(request, response, next)

            expect(insertGenericError).toHaveBeenCalledWith(new Error(), 'crn', 'empty')
            expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
              request,
              response,
              new Error(),
              pathFromStatus(status),
            )
          })
        })

        describe('when there is a CRN search error', () => {
          it('does not call the API to fetch results', async () => {
            ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({
              errors: { crn: { text: 'You must enter a CRN', attributes: {} } },
              errorSummary: [],
              userInput: {},
            })

            const requestHandler = assessmentsController.list(status)
            await requestHandler(request, response, next)

            expect(assessmentsService.getAllForLoggedInUser).not.toHaveBeenCalled()
          })
        })
      },
    )
  })

  describe('summary', () => {
    it('shows a summary view of the assessment', async () => {
      const assessmentId = 'some-assessment-id'
      const assessment = assessmentFactory.build({ id: assessmentId })
      assessmentsService.findAssessment.mockResolvedValue(assessment)
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({ errors: {}, errorSummary: [], userInput: {} })
      jest.spyOn(assessmentUtils, 'assessmentActions').mockReturnValue(actions)
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
      jest.spyOn(assessmentUtils, 'assessmentActions').mockReturnValue(actions)
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

  describe('confirmRejection', () => {
    it('calls render with the assessment id and the rejection reasons', async () => {
      const assessment = assessmentFactory.build()
      const referralRejectionReasons = referenceDataFactory.buildList(3)

      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({ errors: {}, errorSummary: [] })
      assessmentsService.findAssessment.mockResolvedValue(assessment)
      assessmentsService.getReferenceData.mockResolvedValue({ referralRejectionReasons })

      const requestHandler = assessmentsController.confirmRejection()

      request.params = { id: assessment.id }

      await requestHandler(request, response, next)

      expect(assessmentsService.getReferenceData).toHaveBeenCalledWith(callConfig)
      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/assessments/confirm-rejection', {
        assessment,
        referralRejectionReasons,
        referralRejectionReasonOtherMatch,
        errors: {},
        errorSummary: [],
      })
    })

    it('calls render with errors', async () => {
      const assessment = assessmentFactory.build()
      const referralRejectionReasons = referenceDataFactory.buildList(3)
      const errors = {
        referralRejectionReasonId: {
          text: 'Select a reason for rejecting this referral',
        },
        isWithdrawn: {
          text: 'Select yes if the probation practitioner asked for the referral to be withdrawn',
        },
      }
      const errorSummary = [
        {
          text: 'Select a reason for rejecting this referral',
        },
        {
          text: 'Select yes if the probation practitioner asked for the referral to be withdrawn',
        },
      ]
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({
        errors,
        errorSummary,
        userInput: undefined,
      })
      assessmentsService.findAssessment.mockResolvedValue(assessment)
      assessmentsService.getReferenceData.mockResolvedValue({ referralRejectionReasons })

      const requestHandler = assessmentsController.confirmRejection()

      request.params = { id: assessment.id }

      await requestHandler(request, response, next)

      expect(assessmentsService.getReferenceData).toHaveBeenCalledWith(callConfig)
      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/assessments/confirm-rejection', {
        assessment,
        referralRejectionReasons,
        referralRejectionReasonOtherMatch,
        errors,
        errorSummary,
      })
    })
  })

  describe('reject', () => {
    beforeEach(() => {
      const referralRejectionReasons = [
        referenceDataFactory.build({ id: 'reason-one-id' }),
        referenceDataFactory.build({ id: 'reason-two-id' }),
        referenceDataFactory.build({ id: 'other-reason-id', name: 'Another reason' }),
      ]
      assessmentsService.getReferenceData.mockResolvedValue({ referralRejectionReasons })
    })

    it('calls the rejectAssessment method on the service with rejection details', async () => {
      const assessmentId = 'assessment-id'
      const referralRejectionReasonId = 'other-reason-id'
      const referralRejectionReasonDetail = 'Some details'
      const isWithdrawn = 'yes'

      jest.spyOn(assessmentUtils, 'statusChangeMessage').mockReturnValue('some info message')

      const requestHandler = assessmentsController.reject()
      request.params = { id: assessmentId }
      request.body = { referralRejectionReasonId, referralRejectionReasonDetail, isWithdrawn }

      await requestHandler(request, response, next)

      expect(assessmentsService.rejectAssessment).toHaveBeenCalledWith(callConfig, assessmentId, {
        ...request.body,
        isWithdrawn: true,
      })
      expect(assessmentUtils.statusChangeMessage).toHaveBeenCalledWith(assessmentId, 'rejected')
      expect(response.redirect).toHaveBeenCalledWith(paths.assessments.summary({ id: assessmentId }))
      expect(request.flash).toHaveBeenCalledWith('success', 'some info message')
    })

    it('does not send the rejection reason details if not other reason', async () => {
      const assessmentId = 'assessment-id'
      const referralRejectionReasonId = 'reason-one-id'
      const referralRejectionReasonDetail = 'Some details'
      const isWithdrawn = 'no'

      jest.spyOn(assessmentUtils, 'statusChangeMessage').mockReturnValue('some info message')

      const requestHandler = assessmentsController.reject()
      request.params = { id: assessmentId }
      request.body = { referralRejectionReasonId, referralRejectionReasonDetail, isWithdrawn }

      await requestHandler(request, response, next)

      expect(assessmentsService.rejectAssessment).toHaveBeenCalledWith(callConfig, assessmentId, {
        referralRejectionReasonId,
        referralRejectionReasonDetail: undefined,
        isWithdrawn: false,
      })
    })

    it('redirects to the reject confirmation page with errors if the questions are not answered', async () => {
      const requestHandler = assessmentsController.reject()
      const assessmentId = 'some-id'

      request.params = { id: assessmentId }
      request.body = {}

      await requestHandler(request, response, next)

      expect(insertGenericError).toHaveBeenCalledTimes(2)
      expect(insertGenericError).toHaveBeenCalledWith(new Error(), 'referralRejectionReasonId', 'empty')
      expect(insertGenericError).toHaveBeenCalledWith(new Error(), 'isWithdrawn', 'empty')
      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        new Error(),
        paths.assessments.confirmRejection({ id: assessmentId }),
      )
    })

    it('redirects to the reject confirmation page with an error if more details are not provided', async () => {
      const requestHandler = assessmentsController.reject()
      const assessmentId = 'other-reason-id'
      const referralRejectionReasons = [
        referenceDataFactory.build({ id: 'reason-id', name: 'A reason' }),
        referenceDataFactory.build({ id: 'other-reason-id', name: 'Another reason' }),
      ]
      assessmentsService.getReferenceData.mockResolvedValue({ referralRejectionReasons })

      request.params = { id: assessmentId }
      request.body = {
        referralRejectionReasonId: 'other-reason-id',
        isWithdrawn: 'no',
        referralRejectionReasonDetail: '   ',
      }

      await requestHandler(request, response, next)

      expect(insertGenericError).toHaveBeenCalledTimes(1)
      expect(insertGenericError).toHaveBeenCalledWith(new Error(), 'referralRejectionReasonDetail', 'empty')
      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        new Error(),
        paths.assessments.confirmRejection({ id: assessmentId }),
      )
    })
  })

  describe('confirm', () => {
    it.each([
      'null' as const,
      'unallocated' as const,
      'in_review' as const,
      'ready_to_place' as const,
      'closed' as const,
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

      jest.spyOn(assessmentUtils, 'statusChangeMessage').mockReturnValue('some info message')

      const requestHandler = assessmentsController.update()
      request.params = { id: assessmentId, status: newStatus }

      await requestHandler(request, response, next)

      expect(assessmentsService.updateAssessmentStatus).toHaveBeenCalledWith(callConfig, assessmentId, newStatus)
      expect(assessmentUtils.statusChangeMessage).toHaveBeenCalledWith(assessmentId, newStatus)
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
      jest.spyOn(utils, 'appendQueryString').mockReturnValue('/path/with/success/token')

      await requestHandler(request, response, next)

      expect(assessmentsService.createNote).toHaveBeenCalledWith(callConfig, assessmentId, newNote)
      expect(request.flash).toHaveBeenCalledWith('success', 'Note saved')
      expect(response.redirect).toHaveBeenCalledWith('/path/with/success/token')
      expect(utils.appendQueryString).toHaveBeenCalledWith(paths.assessments.summary({ id: assessmentId }), {
        success: 'true',
      })
    })

    it('redirects to the assessment summary page with errors if the API returns an error', async () => {
      const requestHandler = assessmentsController.createNote()
      const assessmentId = 'some-id'
      const newNote = newReferralHistoryUserNoteFactory.build()

      const err = new Error()

      assessmentsService.createNote.mockRejectedValue(err)
      jest.spyOn(utils, 'appendQueryString').mockReturnValue('/path/with/failure/token')

      request.params = { id: assessmentId }
      request.body = { message: newNote.message }

      await requestHandler(request, response, next)

      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(request, response, err, '/path/with/failure/token')
      expect(utils.appendQueryString).toHaveBeenCalledWith(paths.assessments.summary({ id: assessmentId }), {
        success: 'false',
      })
    })
  })
})
