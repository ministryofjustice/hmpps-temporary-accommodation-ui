import { Request, Response } from 'express'
import { TemporaryAccommodationAssessment as Assessment } from '../@types/shared'
import { PlaceContext } from '../@types/ui'
import type { AssessmentsService } from '../services'
import extractCallConfig from './restUtils'
import { appendQueryString } from './utils'

export const createPlaceContext = (assessment: Assessment) => {
  return { assessment }
}

export const addPlaceContext = (path: string, placeContext: PlaceContext) => {
  if (placeContext) {
    return appendQueryString(path, { placeContextAssessmentId: placeContext.assessment.id })
  }
  return path
}

export const preservePlaceContext = async (
  req: Request,
  res: Response,
  assessmentService: AssessmentsService,
): Promise<PlaceContext> => {
  if (req.query.placeContextAssessmentId) {
    let assessment: Assessment

    try {
      assessment = await assessmentService.findAssessment(
        extractCallConfig(req),
        req.query.placeContextAssessmentId as string,
      )
    } catch (err) {
      return undefined
    }

    res.locals.placeContext = { assessment }
    return { assessment }
  }

  return undefined
}

