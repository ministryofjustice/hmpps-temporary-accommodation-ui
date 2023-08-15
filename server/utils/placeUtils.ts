import { TemporaryAccommodationAssessment as Assessment } from '../@types/shared'
import { PlaceContext } from '../@types/ui'
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
