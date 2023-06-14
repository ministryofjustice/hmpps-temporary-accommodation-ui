import { applicationFactory, assessmentFactory } from '../../testutils/factories'
import isAssessment from './isAssessment'

describe('isAssessment', () => {
  it('returns false', () => {
    const application = applicationFactory.build()
    const assessment = assessmentFactory.build()

    expect(isAssessment(application)).toEqual(false)
    expect(isAssessment(assessment)).toEqual(false)
  })
})
