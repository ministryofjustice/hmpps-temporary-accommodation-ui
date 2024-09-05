import getTaskStatus from '../form-pages/utils/getTaskStatus'
import { applicationFactory } from '../testutils/factories'
import getSections from '../utils/assessments/getSections'
import TasklistService from './tasklistService'

jest.mock('../form-pages/utils/getTaskStatus')
jest.mock('../utils/assessments/getSections')

const sections = [
  {
    title: 'First section',
    name: 'first-section',
    actionText: 'Complete  section',
    tasks: [
      {
        id: 'first-task',
        title: 'First task',
        actionText: 'Complete first task',
        pages: {},
      },
      {
        id: 'second-task',
        title: 'Second task',
        actionText: 'Complete second task',
        pages: {},
      },
    ],
  },
  {
    title: 'Second section',
    name: 'second-section',
    tasks: [
      {
        id: 'third-task',
        title: 'Third task',
        actionText: 'Complete third task',
        pages: {},
      },
      {
        id: 'fourth-task',
        title: 'Fourth task',
        actionText: 'Complete fourth task',
        pages: {},
      },
      {
        id: 'fifth-task',
        title: 'Fifth task',
        actionText: 'Complete fifth task',
        pages: {},
      },
    ],
  },
  {
    title: 'Check your answers',
    name: 'check-your-answers',
    tasks: [
      {
        id: 'check-your-answers',
        title: 'Check your answers',
        actionText: 'Complete task',
        pages: {},
      },
    ],
  },
]

describe('tasklistService', () => {
  const application = applicationFactory.build({ id: 'some-uuid' })

  beforeEach(() => {
    jest.resetAllMocks()
    ;(getSections as jest.MockedFunction<typeof getSections>).mockReturnValue(sections)
  })

  describe('taskStatuses', () => {
    it('shows the first task as not_started and subsequent tasks as cannot_start_yet', () => {
      ;(getTaskStatus as jest.Mock).mockReturnValue('not_started')

      const tasklistService = new TasklistService(application)

      expect(tasklistService.taskStatuses).toEqual({
        'first-task': 'not_started',
        'second-task': 'cannot_start',
        'third-task': 'cannot_start',
        'fourth-task': 'cannot_start',
        'fifth-task': 'cannot_start',
        'check-your-answers': 'cannot_start',
      })

      expect(getTaskStatus).toHaveBeenCalledTimes(5)
    })

    it('shows the not started task after a complete task as not_started and subsequent tasks as cannot_start_yet', () => {
      ;(getTaskStatus as jest.Mock).mockImplementation(t => {
        switch (t.id) {
          case 'first-task':
            return 'complete'
          default:
            return 'not_started'
        }
      })

      const tasklistService = new TasklistService(application)

      expect(tasklistService.taskStatuses).toEqual({
        'first-task': 'complete',
        'second-task': 'not_started',
        'third-task': 'cannot_start',
        'fourth-task': 'cannot_start',
        'fifth-task': 'cannot_start',
        'check-your-answers': 'cannot_start',
      })

      expect(getTaskStatus).toHaveBeenCalledTimes(5)
    })

    it('shows the first incomplete task as in_progress and subsequent tasks as cannot_start_yet', () => {
      ;(getTaskStatus as jest.Mock).mockImplementation(t => {
        switch (t.id) {
          case 'first-task':
            return 'complete'
          case 'second-task':
            return 'in_progress'
          default:
            return 'not_started'
        }
      })

      const tasklistService = new TasklistService(application)

      expect(tasklistService.taskStatuses).toEqual({
        'first-task': 'complete',
        'second-task': 'in_progress',
        'third-task': 'cannot_start',
        'fourth-task': 'cannot_start',
        'fifth-task': 'cannot_start',
        'check-your-answers': 'cannot_start',
      })

      expect(getTaskStatus).toHaveBeenCalledTimes(5)
    })

    it('can show in_progress tasks amongst complete tasks', () => {
      ;(getTaskStatus as jest.Mock).mockImplementation(t => {
        switch (t.id) {
          case 'first-task':
          case 'third-task':
            return 'complete'
          case 'second-task':
            return 'in_progress'
          default:
            return 'not_started'
        }
      })

      const tasklistService = new TasklistService(application)

      expect(tasklistService.taskStatuses).toEqual({
        'first-task': 'complete',
        'second-task': 'in_progress',
        'third-task': 'complete',
        'fourth-task': 'not_started',
        'fifth-task': 'cannot_start',
        'check-your-answers': 'cannot_start',
      })

      expect(getTaskStatus).toHaveBeenCalledTimes(5)
    })

    it.each(['not_started' as const, 'complete' as const])(
      'returns the actual task status %s for Check your answers if all other tasks are complete',
      status => {
        ;(getTaskStatus as jest.Mock).mockImplementation(t => {
          switch (t.id) {
            case 'check-your-answers':
              return status
            default:
              return 'complete'
          }
        })

        const tasklistService = new TasklistService(application)

        expect(tasklistService.taskStatuses).toEqual({
          'first-task': 'complete',
          'second-task': 'complete',
          'third-task': 'complete',
          'fourth-task': 'complete',
          'fifth-task': 'complete',
          'check-your-answers': status,
        })

        expect(getTaskStatus).toHaveBeenCalledTimes(6)
      },
    )
  })

  describe('completeSectionCount', () => {
    it('returns zero when there are no complete sections', () => {
      ;(getTaskStatus as jest.Mock).mockReturnValue('not_started')

      const tasklistService = new TasklistService(application)

      expect(tasklistService.completeSectionCount).toEqual(0)
    })

    it('returns 1 when one section is complete', () => {
      ;(getTaskStatus as jest.Mock).mockImplementation(t =>
        ['first-task', 'second-task', 'third-task'].includes(t.id) ? 'complete' : 'not_started',
      )

      const tasklistService = new TasklistService(application)

      expect(tasklistService.completeSectionCount).toEqual(1)
    })

    it('returns 3 when all sections are complete', () => {
      ;(getTaskStatus as jest.Mock).mockReturnValue('complete')

      const tasklistService = new TasklistService(application)

      expect(tasklistService.completeSectionCount).toEqual(3)
    })
  })

  describe('status', () => {
    it('returns complete when all sections are complete', () => {
      ;(getTaskStatus as jest.Mock).mockReturnValue('complete')

      const tasklistService = new TasklistService(application)

      expect(tasklistService.status).toEqual('complete')
    })

    it('returns incomplete when not all sections are complete', () => {
      ;(getTaskStatus as jest.Mock).mockReturnValue('not_started')

      const tasklistService = new TasklistService(application)

      expect(tasklistService.status).toEqual('incomplete')
    })
  })

  describe('sections', () => {
    it('returns the section data with the status of each task and the section number', () => {
      ;(getTaskStatus as jest.Mock).mockReturnValue('not_started')

      const tasklistService = new TasklistService(application)

      expect(tasklistService.sections).toEqual([
        {
          sectionNumber: 1,
          title: 'First section',
          tasks: [
            {
              id: 'first-task',
              title: 'First task',
              actionText: 'Complete first task',
              pages: {},
              status: 'not_started',
            },
            {
              id: 'second-task',
              title: 'Second task',
              actionText: 'Complete second task',
              pages: {},
              status: 'cannot_start',
            },
          ],
        },
        {
          sectionNumber: 2,
          title: 'Second section',
          tasks: [
            {
              id: 'third-task',
              title: 'Third task',
              actionText: 'Complete third task',
              pages: {},
              status: 'cannot_start',
            },
            {
              id: 'fourth-task',
              title: 'Fourth task',
              actionText: 'Complete fourth task',
              pages: {},
              status: 'cannot_start',
            },
            {
              id: 'fifth-task',
              title: 'Fifth task',
              actionText: 'Complete fifth task',
              pages: {},
              status: 'cannot_start',
            },
          ],
        },
        {
          sectionNumber: 3,
          title: 'Check your answers',
          tasks: [
            {
              id: 'check-your-answers',
              title: 'Check your answers',
              actionText: 'Complete task',
              pages: {},
              status: 'cannot_start',
            },
          ],
        },
      ])
    })
  })
})
