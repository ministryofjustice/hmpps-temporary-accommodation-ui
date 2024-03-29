import { Request, Response } from 'express'
import { TemporaryAccommodationAssessment as Assessment } from '../@types/shared'
import { PlaceContext } from '../@types/ui'
import type { AssessmentsService } from '../services'
import extractCallConfig from './restUtils'
import { appendQueryString } from './utils'

export const createPlaceContext = (assessment: Assessment) => {
  return { assessment }
}

export const updatePlaceContextWithArrivalDate = (res: Response, placeContext: PlaceContext, arrivalDate: string) => {
  if (placeContext) {
    const updatedPlaceContext = { ...placeContext, arrivalDate }

    res.locals.placeContext = updatedPlaceContext

    return updatedPlaceContext
  }

  return undefined
}

export const addPlaceContext = (path: string, placeContext: PlaceContext) => {
  if (placeContext) {
    return appendQueryString(path, {
      placeContextAssessmentId: placeContext.assessment.id,
      placeContextArrivalDate: placeContext.arrivalDate,
    })
  }
  return path
}

export const addPlaceContextFromAssessmentId = (path: string, assessmentId: string) => {
  return appendQueryString(path, {
    placeContextAssessmentId: assessmentId,
  })
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

    if (assessment.status !== 'ready_to_place') {
      return undefined
    }

    const placeContext = { assessment, arrivalDate: req.query.placeContextArrivalDate as string }
    res.locals.placeContext = placeContext
    return placeContext
  }

  return undefined
}

export const clearPlaceContext = (req: Request, res: Response) => {
  res.locals.placeContext = undefined
  req.query.placeContextAssessmentId = undefined
  req.query.placeContextArrivalDate = undefined
}
