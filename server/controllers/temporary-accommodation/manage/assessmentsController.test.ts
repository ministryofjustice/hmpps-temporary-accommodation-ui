import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import { AssessmentSearchApiStatus, AssessmentUpdatableDateField } from '@approved-premises/ui'
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
import { DateFormats } from '../../../utils/dateUtils'

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
      html: '<a href="?sortBy=name&sortDirection=asc"><button>Name</button></a>',
      attributes: {
        'aria-sort': 'none',
      },
    },
    {
      html: '<a href="?sortBy=crn&sortDirection=asc"><button>CRN</button></a>',
      attributes: {
        'aria-sort': 'none',
      },
    },
    {
      html: '<a href="?sortBy=createdAt&sortDirection=asc"><button>Referral received</button></a>',
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
          html: '<a href="?sortBy=status&sortDirection=asc"><button>Status</button></a>',
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
              html: '<a href="?sortBy=arrivedAt&sortDirection=asc"><button>Bedspace required</button></a>',
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
          })

          expect(assessmentsService.getAllForLoggedInUser).toHaveBeenCalledWith(callConfig, status, {
            page: 2,
            sortBy: 'createdAt',
            sortDirection: 'desc',
          })
        })

        describe('when there is a CRN or Name search parameter', () => {
          it('renders the filtered table view', async () => {
            const assessments = assessmentSummaries.build()
            const searchParameters = assessmentSearchParametersFactory.build()

            jest.spyOn(assessmentUtils, 'createTableHeadings').mockReturnValue([])
            assessmentsService.getAllForLoggedInUser.mockResolvedValue(assessments)
            request.query = searchParameters as ParsedQs

            const requestHandler = assessmentsController.list(status)
            await requestHandler(request, response, next)

            expect(assessmentsService.getAllForLoggedInUser).toHaveBeenCalledWith(callConfig, status, {
              crnOrName: searchParameters.crnOrName,
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
              crnOrName: searchParameters.crnOrName,
            })
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
    it('shows a full view of a referral with row actions and updated information', async () => {
      const assessmentId = 'some-assessment-id'
      const assessment = assessmentFactory.build({ id: assessmentId })
      assessmentsService.findAssessment.mockResolvedValue(assessment)
      request.params = { id: assessmentId }

      const requestHandler = assessmentsController.full()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/assessments/full', {
        assessment,
        rowActions: {
          'Release date': [
            {
              text: 'Change',
              href: paths.assessments.changeDate.releaseDate({ id: assessmentId }),
              visuallyHiddenText: "the person's release date",
            },
          ],
          'Accommodation required from date': [
            {
              text: 'Change',
              href: paths.assessments.changeDate.accommodationRequiredFromDate({ id: assessmentId }),
              visuallyHiddenText: 'the date accommodation is required',
            },
          ],
        },
        updatedResponses: {
          'Release date': DateFormats.isoDateToUIDate(assessment.releaseDate),
          'Accommodation required from date': DateFormats.isoDateToUIDate(assessment.accommodationRequiredFromDate),
        },
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
        ppRequestedWithdrawal: {
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
        referenceDataFactory.build({ id: 'other-reason-id', name: 'Another reason (please add)' }),
      ]
      assessmentsService.getReferenceData.mockResolvedValue({ referralRejectionReasons })
    })

    it('calls the rejectAssessment method on the service with rejection details', async () => {
      const assessmentId = 'assessment-id'
      const referralRejectionReasonId = 'other-reason-id'
      const referralRejectionReasonDetail = 'Some details'
      const ppRequestedWithdrawal = 'yes'

      jest.spyOn(assessmentUtils, 'statusChangeMessage').mockReturnValue('some info message')

      const requestHandler = assessmentsController.reject()
      request.params = { id: assessmentId }
      request.body = { referralRejectionReasonId, referralRejectionReasonDetail, ppRequestedWithdrawal }

      await requestHandler(request, response, next)

      expect(assessmentsService.rejectAssessment).toHaveBeenCalledWith(callConfig, assessmentId, {
        document: {},
        rejectionRationale: 'default',
        referralRejectionReasonId,
        referralRejectionReasonDetail,
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
      const ppRequestedWithdrawal = 'no'

      jest.spyOn(assessmentUtils, 'statusChangeMessage').mockReturnValue('some info message')

      const requestHandler = assessmentsController.reject()
      request.params = { id: assessmentId }
      request.body = { referralRejectionReasonId, referralRejectionReasonDetail, ppRequestedWithdrawal }

      await requestHandler(request, response, next)

      expect(assessmentsService.rejectAssessment).toHaveBeenCalledWith(callConfig, assessmentId, {
        document: {},
        rejectionRationale: 'default',
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
      expect(insertGenericError).toHaveBeenCalledWith(new Error(), 'ppRequestedWithdrawal', 'empty')
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

      request.params = { id: assessmentId }
      request.body = {
        referralRejectionReasonId: 'other-reason-id',
        ppRequestedWithdrawal: 'no',
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

  describe('changeDate', () => {
    describe.each([
      ['release date', 'releaseDate'],
      ['accommodation required from date', 'accommodationRequiredFromDate'],
    ])('when changing the %s', (_, dateField: AssessmentUpdatableDateField) => {
      it('renders the form with the correct date type and the assessment details', async () => {
        const content = { docTitle: 'foo', title: 'bar' }
        const assessment = assessmentFactory.build()

        jest.spyOn(assessmentUtils, 'changeDatePageContent').mockReturnValue(content)
        assessmentsService.findAssessment.mockResolvedValue(assessment)

        const requestHandler = assessmentsController.changeDate(dateField)

        request.params = { id: assessment.id }

        await requestHandler(request, response, next)

        expect(response.render).toHaveBeenCalledWith('temporary-accommodation/assessments/change-date', {
          assessment,
          content,
          dateField,
          ...DateFormats.isoToDateAndTimeInputs(assessment[dateField], dateField),
          errors: {},
          errorSummary: [],
        })
      })

      it('replaces the existing date with user input', async () => {
        const userInput = {
          [`${dateField}-day`]: '18',
          [`${dateField}-month`]: '8',
          [`${dateField}-year`]: '2024',
        }
        ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({
          errors: {},
          errorSummary: [],
          userInput,
        })
        const assessment = assessmentFactory.build({
          [dateField]: '2024-06-10',
        })
        assessmentsService.findAssessment.mockResolvedValue(assessment)

        const requestHandler = assessmentsController.changeDate(dateField)

        request.params = { id: assessment.id }

        await requestHandler(request, response, next)

        expect(response.render).toHaveBeenCalledWith(
          'temporary-accommodation/assessments/change-date',
          expect.objectContaining({
            ...userInput,
          }),
        )
      })
    })
  })

  describe('updateDate', () => {
    describe.each([
      ['release date', 'releaseDate'],
      ['accommodation required from date', 'accommodationRequiredFromDate'],
    ])('when changing the %s', (_, dateField: AssessmentUpdatableDateField) => {
      it('calls the updateAssessment method on the service with new date', async () => {
        const assessmentId = 'assessment-id'
        const updatedDate = '2024-06-09'

        const requestHandler = assessmentsController.updateDate(dateField)
        request.params = { id: assessmentId }
        request.body = {
          ...DateFormats.isoToDateAndTimeInputs(updatedDate, dateField),
        }

        await requestHandler(request, response, next)

        expect(assessmentsService.updateAssessment).toHaveBeenCalledWith(callConfig, assessmentId, {
          [dateField]: updatedDate,
        })
        expect(response.redirect).toHaveBeenCalledWith(paths.assessments.summary({ id: assessmentId }))
        expect(request.flash).toHaveBeenCalledWith('success', {
          title: 'Update successful',
          html: `The referral has been updated with your changes.<br><br><a class="govuk-link" href="${paths.assessments.index(
            {},
          )}">View all referrals</a>`,
        })
      })

      it('redirects to the change date form with a date error from the API', async () => {
        jest.spyOn(assessmentUtils, 'insertUpdateDateError')
        const assessmentId = 'assessment-id'
        const updatedDate = '2024-06-20'
        const error = {
          status: 400,
          data: {
            title: 'Bad request',
            detail:
              dateField === 'releaseDate'
                ? 'Release date cannot be after accommodation required from date: 2024-07-01'
                : 'Accommodation required from date cannot be before release date: 2024-07-10',
          },
        }

        assessmentsService.updateAssessment.mockImplementationOnce(() => {
          throw error
        })

        const requestHandler = assessmentsController.updateDate(dateField)

        request.params = { id: assessmentId }
        request.body = {
          ...DateFormats.isoToDateAndTimeInputs(updatedDate, dateField),
        }

        await requestHandler(request, response, next)

        expect(assessmentUtils.insertUpdateDateError).toHaveBeenCalledWith(error, assessmentId)
        expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
          request,
          response,
          error,
          paths.assessments.changeDate[dateField]({ id: assessmentId }),
          'assessmentUpdate',
        )
      })

      it.each([
        ['empty', ''],
        ['invalid', '2024-13-32'],
      ])('creates errors without calling the API if the date is %s', async (errorType, submittedDate) => {
        const assessmentId = 'assessment-id'
        const dateParts = submittedDate.split('-')

        const requestHandler = assessmentsController.updateDate(dateField)

        request.params = { id: assessmentId }
        request.body = submittedDate
          ? {
              [`${dateField}-day`]: dateParts[2],
              [`${dateField}-month`]: dateParts[1],
              [`${dateField}-year`]: dateParts[0],
            }
          : {}

        await requestHandler(request, response, next)

        expect(insertGenericError).toHaveBeenCalledWith(new Error(), dateField, errorType)
        expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
          request,
          response,
          new Error(),
          paths.assessments.changeDate[dateField]({ id: assessmentId }),
          'assessmentUpdate',
        )
        expect(assessmentsService.updateAssessment).not.toHaveBeenCalled()
      })
    })
  })
})
