import type { Request, RequestHandler, Response } from 'express'
import {
  TemporaryAccommodationAssessment as Assessment,
  TemporaryAccommodationAssessmentStatus as AssessmentStatus,
} from '../../../@types/shared'
import paths from '../../../paths/temporary-accommodation/manage'
import AssessmentsService from '../../../services/assessmentsService'
import { assessmentActions, statusName } from '../../../utils/assessmentUtils'
import extractCallConfig from '../../../utils/restUtils'
import { lowerCase } from '../../../utils/utils'

export const assessmentsTableHeaders = [
  {
    text: 'Name',
    attributes: {
      'aria-sort': 'ascending',
    },
  },
  {
    text: 'CRN',
    attributes: {
      'aria-sort': 'none',
    },
  },
  {
    text: 'Referral received',
    attributes: {
      'aria-sort': 'none',
    },
  },
  {
    text: 'Bedspace required',
    attributes: {
      'aria-sort': 'none',
    },
  },
]

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
      const callConfig = extractCallConfig(req)

      const { unallocatedTableRows, inProgressTableRows, readyToPlaceTableRows } =
        await this.assessmentsService.getAllForLoggedInUser(callConfig)

      return res.render('temporary-accommodation/assessments/index', {
        unallocatedTableRows,
        inProgressTableRows,
        readyToPlaceTableRows,
        tableHeaders: assessmentsTableHeaders,
      })
    }
  }

  archive(): RequestHandler {
    return async (req: Request, res: Response) => {
      const callConfig = extractCallConfig(req)

      const { archivedTableRows } = await this.assessmentsService.getAllForLoggedInUser(callConfig)

      return res.render('temporary-accommodation/assessments/archive', {
        archivedTableRows,
      })
    }
  }

  show(): RequestHandler {
    return async (req: Request, res: Response) => {
      const callConfig = extractCallConfig(req)

      const assessment = await this.assessmentsService.findAssessment(callConfig, req.params.id)

      return res.render('temporary-accommodation/assessments/show', {
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

      req.flash('info', `Assessment updated status updated to "${lowerCase(statusName(status as AssessmentStatus))}"`)
      res.redirect(paths.assessments.show({ id }))
    }
  }
}
