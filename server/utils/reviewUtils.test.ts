import { applicationFactory } from '../testutils/factories'
import getSections from './assessments/getSections'
import reviewSections from './reviewUtils'
import { TasklistPageInterface } from '../form-pages/tasklistPage'

jest.mock('./assessments/getSections')

const sections = [
  {
    title: 'First section',
    name: 'first-section',
    tasks: [
      {
        id: 'basic-information',
        title: 'Basic information',
        pages: {
          'basic-information': {} as TasklistPageInterface,
          'type-of-ap': {} as TasklistPageInterface,
        },
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

    const result = reviewSections(application, spy)

    expect(getSections).toHaveBeenCalledWith(application, true)
    expect(result).toHaveLength(sections.length)
  })

  it('returns an object with the titles of each section and an object for each task', () => {
    const application = applicationFactory.build()
    const spy = jest.fn()

    const result = reviewSections(application, spy)

    expect(getSections).toHaveBeenCalledWith(application, true)
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
      {
        tasks: [],
        title: 'Second section',
      },
    ])
  })

  it('calls the rowFunction for each task with the task and application', () => {
    const application = applicationFactory.build()
    const spy = jest.fn()

    reviewSections(application, spy)

    expect(getSections).toHaveBeenCalledWith(application, true)
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
