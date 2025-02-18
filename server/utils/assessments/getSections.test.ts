import { Unit } from '@approved-premises/api'
import Apply from '../../form-pages/apply'
import Assess from '../../form-pages/assess'
import { applicationFactory, assessmentFactory } from '../../testutils/factories'
import getSections from './getSections'
import isAssessment from './isAssessment'

jest.mock('../../form-pages/apply', () => {
  return {
    pages: { 'apply-page-1': {} },
    sections: [
      {
        title: 'Apply section',
        tasks: [
          {
            id: 'apply-page-1',
            title: 'Apply page one',
            pages: { 'apply-page-1': {} },
          },
        ],
      },
      {
        title: 'Check your answers',
        name: 'CheckYourAnswers',
        tasks: [] as Array<Unit>,
      },
    ],
  }
})
jest.mock('../../form-pages/assess', () => {
  return {
    pages: { 'assess-page': {} },
    sections: [
      {
        title: 'Assess section',
        tasks: [
          {
            id: 'assess-page-1',
            title: 'Assess page one',
            pages: { 'assess-page-1': {} },
          },
        ],
      },
    ],
  }
})
jest.mock('./isAssessment')

describe('getSections', () => {
  it('returns Apply sections when given an application', () => {
    ;(isAssessment as jest.MockedFunction<typeof isAssessment>).mockReturnValue(false)

    const application = applicationFactory.build()
    const sections = getSections(application)

    expect(sections).toEqual(Apply.sections)
  })

  it('returns Assess sections when given an application', () => {
    ;(isAssessment as jest.MockedFunction<typeof isAssessment>).mockReturnValue(true)

    const assessment = assessmentFactory.build()
    const sections = getSections(assessment)

    expect(sections).toEqual(Assess.sections)
  })

  it('excludes the check your answers section when excludeCheckYourAnswers is set', () => {
    ;(isAssessment as jest.MockedFunction<typeof isAssessment>).mockReturnValue(false)

    const application = applicationFactory.build()
    const sections = getSections(application, true)

    expect(sections).toEqual([Apply.sections[0]])
  })
})
