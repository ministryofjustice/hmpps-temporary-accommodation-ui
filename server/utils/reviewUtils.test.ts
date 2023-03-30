import Apply from '../form-pages/apply'
import { applicationFactory, assessmentFactory } from '../testutils/factories'
import isAssessment from './assessments/isAssessment'
import reviewSections from './reviewUtils'

jest.mock('./assessments/isAssessment')

jest.mock('../form-pages/apply', () => {
  return {
    pages: { 'basic-information': {}, 'type-of-ap': {} },
    sections: [
      {
        title: 'First',
        tasks: [
          {
            id: 'basic-information',
            title: 'Basic Information',
            pages: { 'basic-information': {}, 'type-of-ap': {} },
          },
        ],
      },
      {
        title: 'Second',
        tasks: [],
      },
    ],
  }
})
jest.mock('../form-pages/assess', () => {
  return {
    pages: { 'assess-page': {} },
    sections: [
      {
        title: 'First',
        tasks: [
          {
            id: 'assess-page-1',
            title: 'Assess page one',
            pages: { 'assess-page-1': {} },
          },
        ],
      },
      {
        title: 'Second',
        tasks: [
          {
            id: 'assess-page-2',
            title: 'Assess page two',
            pages: { 'assess-page-2': {} },
          },
        ],
      },
    ],
  }
})

describe('reviewSections', () => {
  it('returns an object for each non-check your answers Apply section', () => {
    const application = applicationFactory.build()
    const spy = jest.fn()

    const nonCheckYourAnswersSections = Apply.sections.slice(0, -1)
    const result = reviewSections(application, spy)

    expect(isAssessment).toHaveBeenCalledWith(application)
    expect(result).toHaveLength(nonCheckYourAnswersSections.length)
  })

  it('returns an object with the titles of each section and an object for each task', () => {
    const application = applicationFactory.build()
    const spy = jest.fn()

    const result = reviewSections(application, spy)

    expect(isAssessment).toHaveBeenCalledWith(application)
    expect(result).toEqual([
      { tasks: [{ id: 'basic-information', rows: undefined, title: 'Basic Information' }], title: 'First' },
    ])
  })

  it('returns the assess page objects if passed an assessment', () => {
    const assessment = assessmentFactory.build()
    const spy = jest.fn()

    ;(isAssessment as unknown as jest.Mock).mockReturnValue(true)

    const result = reviewSections(assessment, spy)

    expect(isAssessment).toHaveBeenCalledWith(assessment)
    expect(result).toEqual([])
  })

  it('calls the rowFunction for each task with the task and application', () => {
    const application = applicationFactory.build()
    const spy = jest.fn()
    ;(isAssessment as unknown as jest.Mock).mockReturnValue(false)

    reviewSections(application, spy)

    expect(isAssessment).toHaveBeenCalledWith(application)
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith(
      {
        id: 'basic-information',
        title: 'Basic Information',
        pages: { 'basic-information': {}, 'type-of-ap': {} },
      },
      application,
    )
  })
})
