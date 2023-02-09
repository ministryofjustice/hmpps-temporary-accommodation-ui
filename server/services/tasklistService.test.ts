import applicationFactory from '../testutils/factories/application'
import TasklistService from './tasklistService'
import getTaskStatus from '../form-pages/utils/getTaskStatus'

jest.mock('../form-pages/apply', () => {
  return {
    sections: [
      {
        title: 'First Section',
        tasks: [
          {
            id: 'first-task',
            title: 'First task',
          },
          {
            id: 'second-task',
            title: 'Second task',
          },
        ],
      },
      {
        title: 'Second Section',
        tasks: [
          {
            id: 'third-task',
            title: 'Third task',
          },
          {
            id: 'fourth-task',
            title: 'Fourth task',
          },
          {
            id: 'fifth-task',
            title: 'Fifth task',
          },
        ],
      },
    ],
  }
})

jest.mock('../form-pages/utils/getTaskStatus')

describe('tasklistService', () => {
  const application = applicationFactory.build({ id: 'some-uuid' })

  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('taskStatuses', () => {
    it('returns cannot_start for any subsequent tasks when no tasks are complete', () => {
      ;(getTaskStatus as jest.Mock).mockReturnValue('not_started')

      const tasklistService = new TasklistService(application)

      expect(tasklistService.taskStatuses).toEqual({
        'first-task': 'not_started',
        'second-task': 'cannot_start',
        'third-task': 'cannot_start',
        'fourth-task': 'cannot_start',
        'fifth-task': 'cannot_start',
      })
    })

    it('returns a status when the previous task is complete', () => {
      ;(getTaskStatus as jest.Mock).mockImplementation(t => {
        if (t.id === 'first-task') {
          return 'complete'
        }
        if (t.id === 'second-task') {
          return 'in_progress'
        }
        return undefined
      })

      const tasklistService = new TasklistService(application)

      expect(tasklistService.taskStatuses).toEqual({
        'first-task': 'complete',
        'second-task': 'in_progress',
        'third-task': 'cannot_start',
        'fourth-task': 'cannot_start',
        'fifth-task': 'cannot_start',
      })

      expect(getTaskStatus).toHaveBeenCalledTimes(2)
    })
  })

  describe('completeSectionCount', () => {
    it('returns zero when there are no complete sections', () => {
      ;(getTaskStatus as jest.Mock).mockReturnValue('not_started')

      const tasklistService = new TasklistService(application)

      expect(tasklistService.completeSectionCount).toEqual(0)
    })

    it('returns 1 when there one section is complete', () => {
      ;(getTaskStatus as jest.Mock).mockImplementation(t =>
        ['first-task', 'second-task', 'third-task'].includes(t.id) ? 'complete' : 'not_started',
      )

      const tasklistService = new TasklistService(application)

      expect(tasklistService.completeSectionCount).toEqual(1)
    })

    it('returns 2 when all sections are complete', () => {
      ;(getTaskStatus as jest.Mock).mockReturnValue('complete')

      const tasklistService = new TasklistService(application)

      expect(tasklistService.completeSectionCount).toEqual(2)
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
      ;(getTaskStatus as jest.Mock).mockReturnValue('cannot_start')

      const tasklistService = new TasklistService(application)

      expect(tasklistService.sections).toEqual([
        {
          sectionNumber: 1,
          title: 'First Section',
          tasks: [
            { id: 'first-task', title: 'First task', status: 'cannot_start' },
            { id: 'second-task', title: 'Second task', status: 'cannot_start' },
          ],
        },
        {
          sectionNumber: 2,
          title: 'Second Section',
          tasks: [
            { id: 'third-task', title: 'Third task', status: 'cannot_start' },
            { id: 'fourth-task', title: 'Fourth task', status: 'cannot_start' },
            { id: 'fifth-task', title: 'Fifth task', status: 'cannot_start' },
          ],
        },
      ])
    })
  })
})
