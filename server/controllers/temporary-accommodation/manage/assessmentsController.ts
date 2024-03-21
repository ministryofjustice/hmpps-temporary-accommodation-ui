import type { Request, RequestHandler, Response } from 'express'
import { AssessmentSearchApiStatus } from '@approved-premises/ui'
import {
  TemporaryAccommodationAssessment as Assessment,
  TemporaryAccommodationAssessmentStatus as AssessmentStatus,
  NewReferralHistoryUserNote as NewNote,
} from '../../../@types/shared'
import paths from '../../../paths/temporary-accommodation/manage'
import AssessmentsService from '../../../services/assessmentsService'
import {
  assessmentActions,
  createTableHeadings,
  getParams,
  pathFromStatus,
  statusChangeMessage,
} from '../../../utils/assessmentUtils'
import { preservePlaceContext } from '../../../utils/placeUtils'
import extractCallConfig from '../../../utils/restUtils'
import { appendQueryString } from '../../../utils/utils'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput, insertGenericError } from '../../../utils/validation'
import { pagination } from '../../../utils/pagination'

export const confirmationPageContent: Record<Assessment['status'], { title: string; text: string }> = {
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
  rejected: {
    title: 'Confirm rejection',
    text: `<p class="govuk-body">You will need to email the community probation practitioner to let them know their referral has been rejected.</p>
      <p class="govuk-body">Once a referral has been rejected it cannot be undone.</p>`,
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

export default class AssessmentsController {
  constructor(private readonly assessmentsService: AssessmentsService) {}

  index(): RequestHandler {
    return async (req: Request, res: Response) => {
      return res.redirect(301, paths.assessments.unallocated.pattern)
    }
  }

  list(status: AssessmentSearchApiStatus): RequestHandler {
    return async (req: Request, res: Response) => {
      const { errors } = fetchErrorsAndUserInput(req)

      const callConfig = extractCallConfig(req)

      const params = getParams(req.query)

      const template =
        status === 'archived'
          ? 'temporary-accommodation/assessments/archive'
          : 'temporary-accommodation/assessments/index'

      try {
        if (params.crn !== undefined && !params.crn.trim().length) {
          const error = new Error()
          insertGenericError(error, 'crn', 'empty')
          throw error
        }

        const response = errors.crn
          ? null
          : await this.assessmentsService.getAllForLoggedInUser(callConfig, status, params)

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
          crn: params.crn,
          pagination: response && pagination(response.pageNumber, response.totalPages, appendQueryString('', params)),
          errors,
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

      return res.render('temporary-accommodation/assessments/summary', {
        assessment,
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

      return res.render('temporary-accommodation/assessments/full', {
        assessment,
        actions: assessmentActions(assessment),
      })
    }
  }

  confirm(): RequestHandler {
    return async (req: Request, res: Response) => {
      return res.render('temporary-accommodation/assessments/confirm', {
        content: confirmationPageContent[req.params.status as string],
        status: req.params.status,
        id: req.params.id,
      })
    }
  }

  update(): RequestHandler {
    return async (req: Request, res: Response) => {
      const callConfig = extractCallConfig(req)

      const { id, status } = req.params

      await this.assessmentsService.updateAssessmentStatus(callConfig, id, status as AssessmentStatus)

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
}
