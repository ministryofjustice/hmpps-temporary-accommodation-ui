import type { Request, RequestHandler, Response } from 'express'
import {
  AssessmentSearchApiStatus,
  AssessmentUpdatableDateField,
  AssessmentUpdateStatus,
  SummaryListActionItem,
} from '@approved-premises/ui'
import {
  TemporaryAccommodationAssessmentStatus as AssessmentStatus,
  NewReferralHistoryUserNote as NewNote,
} from '../../../@types/shared'
import paths from '../../../paths/temporary-accommodation/manage'
import AssessmentsService from '../../../services/assessmentsService'
import {
  assessmentActions,
  changeDatePageContent,
  createTableHeadings,
  getParams,
  insertUpdateDateError,
  pathFromStatus,
  referralRejectionReasonIsOther,
  statusChangeMessage,
} from '../../../utils/assessmentUtils'
import { preservePlaceContext } from '../../../utils/placeUtils'
import extractCallConfig from '../../../utils/restUtils'
import { appendQueryString } from '../../../utils/utils'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput, insertGenericError } from '../../../utils/validation'
import { pagination } from '../../../utils/pagination'
import { DateFormats, dateExists } from '../../../utils/dateUtils'
import { TimelineService } from '../../../services'

export const confirmationPageContent: Record<AssessmentUpdateStatus, { title: string; text: string }> = {
  in_review: {
    title: 'Mark this referral as in review',
    text: '<p class="govuk-body">Mark this referral as in review if you or a HPT colleague are working on this referral.</p>',
  },
  ready_to_place: {
    title: 'Confirm this referral is ready to place',
    text: `<p class="govuk-body">Mark this referral as ready to place to find a suitable bedspace.</p>
      <p class="govuk-body">Some regions will require approval before a bedspace is booked. Other regions require an address before approvals can be given. Check with your manager if you are unsure.</p>
      <p class="govuk-body">Once a person has been placed the referral should be archived.</p>`,
  },
  closed: {
    title: 'Archive this referral',
    text: '<p class="govuk-body">This referral should be archived once a bedspace booking has been confirmed.</p>',
  },
  unallocated: {
    title: 'Unallocate this referral',
    text: `<p class="govuk-body">Mark this referral as unallocated if it is not being reviewed by yourself or a HPT colleague.</p>
            <p class="govuk-body"> The referral will be updated to 'unallocated'.</p>`,
  },
}

export const referralRejectionReasonOtherMatch = 'Another reason (please add)'

export default class AssessmentsController {
  constructor(
    private readonly assessmentsService: AssessmentsService,
    private readonly timelineService: TimelineService,
  ) {}

  list(status: AssessmentSearchApiStatus): RequestHandler {
    return async (req: Request, res: Response) => {
      const callConfig = extractCallConfig(req)

      const params = getParams(req.query)

      const template =
        status === 'archived'
          ? 'temporary-accommodation/assessments/archive'
          : 'temporary-accommodation/assessments/index'

      try {
        const response = await this.assessmentsService.getAllForLoggedInUser(callConfig, status, params)

        return res.render(template, {
          status,
          basePath: pathFromStatus(status),
          tableRows: response?.data,
          tableHeaders: createTableHeadings(
            params.sortBy,
            params.sortDirection === 'asc',
            appendQueryString('', params),
            status === 'archived',
          ),
          crnOrName: params.crnOrName,
          pagination: response && pagination(response.pageNumber, response.totalPages, appendQueryString('', params)),
        })
      } catch (err) {
        return catchValidationErrorOrPropogate(req, res, err, pathFromStatus(status))
      }
    }
  }

  summary(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { errors, errorSummary, errorTitle, userInput } = fetchErrorsAndUserInput(req)

      const callConfig = extractCallConfig(req)

      await preservePlaceContext(req, res, this.assessmentsService)

      const assessment = await this.assessmentsService.findAssessment(callConfig, req.params.id)
      const timelineEvents = await this.timelineService.getTimelineForAssessment(callConfig, req.params.id)

      return res.render('temporary-accommodation/assessments/summary', {
        assessment,
        timelineEvents,
        actions: assessmentActions(assessment),
        errors,
        errorSummary,
        errorTitle,
        ...userInput,
      })
    }
  }

  full(): RequestHandler {
    return async (req: Request, res: Response) => {
      const callConfig = extractCallConfig(req)

      await preservePlaceContext(req, res, this.assessmentsService)

      const assessment = await this.assessmentsService.findAssessment(callConfig, req.params.id)

      const rowActions: Record<string, SummaryListActionItem[]> = {
        'Release date': [
          {
            text: 'Change',
            href: paths.assessments.changeDate.releaseDate({ id: assessment.id }),
            visuallyHiddenText: "the person's release date",
          },
        ],
        'Accommodation required from date': [
          {
            text: 'Change',
            href: paths.assessments.changeDate.accommodationRequiredFromDate({ id: assessment.id }),
            visuallyHiddenText: 'the date accommodation is required',
          },
        ],
      }
      const updatedResponses = {
        'Release date': DateFormats.isoDateToUIDate(assessment.releaseDate),
        'Accommodation required from date': DateFormats.isoDateToUIDate(assessment.accommodationRequiredFromDate),
      }

      return res.render('temporary-accommodation/assessments/full', {
        assessment,
        rowActions,
        updatedResponses,
      })
    }
  }

  confirmRejection(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)

      const callConfig = extractCallConfig(req)

      const assessment = await this.assessmentsService.findAssessment(callConfig, req.params.id)
      const { referralRejectionReasons } = await this.assessmentsService.getReferenceData(callConfig)

      return res.render('temporary-accommodation/assessments/confirm-rejection', {
        assessment,
        referralRejectionReasons,
        referralRejectionReasonOtherMatch,
        errors,
        errorSummary,
        ...userInput,
      })
    }
  }

  reject(): RequestHandler {
    return async (req: Request, res: Response) => {
      const callConfig = extractCallConfig(req)

      const { referralRejectionReasons } = await this.assessmentsService.getReferenceData(callConfig)

      const { id } = req.params
      const { referralRejectionReasonId, referralRejectionReasonDetail, ppRequestedWithdrawal } = req.body

      try {
        let error: Error
        let isOtherReason = false

        if (!referralRejectionReasonId) {
          error = new Error()
          insertGenericError(error, 'referralRejectionReasonId', 'empty')
        } else {
          isOtherReason = referralRejectionReasonIsOther(
            referralRejectionReasonId,
            referralRejectionReasonOtherMatch,
            referralRejectionReasons,
          )

          if (isOtherReason && (!referralRejectionReasonDetail || referralRejectionReasonDetail.trim() === '')) {
            error = new Error()
            insertGenericError(error, 'referralRejectionReasonDetail', 'empty')
          }
        }

        if (!ppRequestedWithdrawal) {
          error = error || new Error()
          insertGenericError(error, 'ppRequestedWithdrawal', 'empty')
        }

        if (error) {
          throw error
        }

        await this.assessmentsService.rejectAssessment(callConfig, id, {
          document: {},
          rejectionRationale: 'default',
          referralRejectionReasonId,
          referralRejectionReasonDetail: isOtherReason ? referralRejectionReasonDetail : undefined,
          isWithdrawn: ppRequestedWithdrawal === 'yes',
        })

        req.flash('success', statusChangeMessage(id, 'rejected'))
        res.redirect(paths.assessments.summary({ id }))
      } catch (err) {
        catchValidationErrorOrPropogate(req, res, err, paths.assessments.confirmRejection({ id }))
      }
    }
  }

  confirm(): RequestHandler {
    return async (req: Request, res: Response) => {
      return res.render('temporary-accommodation/assessments/confirm', {
        content: confirmationPageContent[req.params.status as AssessmentUpdateStatus],
        status: req.params.status,
        id: req.params.id,
      })
    }
  }

  update(): RequestHandler {
    return async (req: Request, res: Response) => {
      const callConfig = extractCallConfig(req)

      const { id, status } = req.params

      await this.assessmentsService.updateAssessmentStatus(callConfig, id, status as AssessmentUpdateStatus)

      req.flash('success', statusChangeMessage(id, status as AssessmentStatus))
      res.redirect(paths.assessments.summary({ id }))
    }
  }

  createNote(): RequestHandler {
    return async (req: Request, res: Response) => {
      const callConfig = extractCallConfig(req)
      const { id } = req.params
      const { message } = req.body

      const newNote: NewNote = {
        message,
      }

      try {
        await this.assessmentsService.createNote(callConfig, id, newNote)

        req.flash('success', 'Note saved')
        res.redirect(appendQueryString(paths.assessments.summary({ id }), { success: 'true' }))
      } catch (err) {
        catchValidationErrorOrPropogate(
          req,
          res,
          err,
          appendQueryString(paths.assessments.summary({ id }), { success: 'false' }),
        )
      }
    }
  }

  changeDate(dateField: AssessmentUpdatableDateField): RequestHandler {
    return async (req: Request, res: Response) => {
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)

      const callConfig = extractCallConfig(req)

      const assessment = await this.assessmentsService.findAssessment(callConfig, req.params.id)

      return res.render('temporary-accommodation/assessments/change-date', {
        content: changeDatePageContent(dateField, assessment),
        dateField,
        assessment,
        errors,
        errorSummary,
        ...(assessment[dateField] ? DateFormats.isoToDateAndTimeInputs(assessment[dateField], dateField) : {}),
        ...userInput,
      })
    }
  }

  updateDate(dateField: AssessmentUpdatableDateField): RequestHandler {
    return async (req: Request, res: Response) => {
      const callConfig = extractCallConfig(req)

      const { id } = req.params

      try {
        const updatedDate = DateFormats.dateAndTimeInputsToIsoString(req.body, dateField)[dateField]

        if (!updatedDate) {
          const error = new Error()
          insertGenericError(error, dateField, 'empty')
          throw error
        } else if (!dateExists(updatedDate)) {
          const error = new Error()
          insertGenericError(error, dateField, 'invalid')
          throw error
        }

        await this.assessmentsService.updateAssessment(callConfig, id, {
          [dateField]: updatedDate,
        })

        req.flash('success', {
          title: 'Update successful',
          html: `The referral has been updated with your changes.<br><br><a class="govuk-link" href="${paths.assessments.index(
            {},
          )}">View all referrals</a>`,
        })
        res.redirect(paths.assessments.summary({ id }))
      } catch (err) {
        if (err.status === 400) {
          if (
            err.data?.detail?.includes('Release date cannot be after accommodation required from date') ||
            err.data?.detail?.includes('Accommodation required from date cannot be before release date')
          ) {
            insertUpdateDateError(err, id)
          }
        }
        catchValidationErrorOrPropogate(
          req,
          res,
          err,
          paths.assessments.changeDate[dateField]({ id }),
          'assessmentUpdate',
        )
      }
    }
  }
}
