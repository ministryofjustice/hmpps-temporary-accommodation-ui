import type { Request, RequestHandler, Response } from 'express'
import AssessmentsService from '../../../services/assessmentsService'
import extractCallConfig from '../../../utils/restUtils'

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
}
