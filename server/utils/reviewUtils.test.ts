import { applicationFactory } from '../testutils/factories'
import getSections from './assessments/getSections'
import reviewSections from './reviewUtils'

jest.mock('./assessments/getSections')

const sections = [
  {
    title: 'First section',
    name: 'first-section',
    tasks: [
      {
        id: 'basic-information',
        title: 'Basic information',
        pages: { 'basic-information': {}, 'type-of-ap': {} },
        actionText: 'Complete basic information',
      },
    ],
  },
  {
    title: 'Second section',
    name: 'second-section',
    tasks: [],
  },
]

describe('reviewSections', () => {
  it('returns an object for each non-check your answers section', () => {
    const application = applicationFactory.build()
    const spy = jest.fn()

    ;(getSections as jest.MockedFunction<typeof getSections>).mockReturnValue(sections)

    const nonCheckYourAnswersSections = sections.slice(0, -1)
    const result = reviewSections(application, spy)

    expect(getSections).toHaveBeenCalledWith(application)
    expect(result).toHaveLength(nonCheckYourAnswersSections.length)
  })

  it('returns an object with the titles of each section and an object for each task', () => {
    const application = applicationFactory.build()
    const spy = jest.fn()

    const result = reviewSections(application, spy)

    expect(getSections).toHaveBeenCalledWith(application)
    expect(result).toEqual([
      {
        tasks: [
          {
            id: 'basic-information',
            rows: undefined,
            title: 'Basic information',
          },
        ],
        title: 'First section',
      },
    ])
  })

  it('calls the rowFunction for each task with the task and application', () => {
    const application = applicationFactory.build()
    const spy = jest.fn()

    reviewSections(application, spy)

    expect(getSections).toHaveBeenCalledWith(application)
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith(
      {
        id: 'basic-information',
        title: 'Basic information',
        pages: { 'basic-information': {}, 'type-of-ap': {} },
        actionText: 'Complete basic information',
      },
      application,
    )
  })
})
