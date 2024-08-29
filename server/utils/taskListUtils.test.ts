import { TaskWithStatus } from '../@types/ui'
import applyPaths from '../paths/apply'
import assessPaths from '../paths/assess'
import { applicationFactory, assessmentFactory } from '../testutils/factories'
import isAssessment from './assessments/isAssessment'
import { statusTag, taskLink } from './taskListUtils'
import { TasklistPageInterface } from '../form-pages/tasklistPage'

jest.mock('./assessments/isAssessment')

describe('taskListUtils', () => {
  const task: TaskWithStatus = {
    id: 'second-task',
    title: 'Second Task',
    actionText: 'Complete Second Task',
    pages: {
      foo: {} as TasklistPageInterface,
      bar: {} as TasklistPageInterface,
    },
    status: 'in_progress',
  }

  describe('taskLink', () => {
    describe('with an application', () => {
      const application = applicationFactory.build({ id: 'some-uuid' })

      it('should return a link to a task the task can be started', () => {
        ;(isAssessment as jest.MockedFunction<typeof isAssessment>).mockReturnValue(false)

        task.status = 'in_progress'

        expect(taskLink(task, application)).toEqual(
          `<a class="govuk-link govuk-task-list__link" href="${applyPaths.applications.pages.show({
            id: 'some-uuid',
            task: 'second-task',
            page: 'foo',
          })}" aria-describedby="second-task-status" data-cy-task-name="second-task">Complete Second Task</a>`,
        )
      })

      it('should return the task name when the task cannot be started', () => {
        task.status = 'cannot_start'

        expect(taskLink(task, application)).toEqual(`Complete Second Task`)
      })
    })

    describe('with an assessment', () => {
      const assessment = assessmentFactory.build({ id: 'some-uuid' })

      it('should return a link to a task the task can be started', () => {
        ;(isAssessment as jest.MockedFunction<typeof isAssessment>).mockReturnValue(true)

        task.status = 'in_progress'

        expect(taskLink(task, assessment)).toEqual(
          `<a class="govuk-link govuk-task-list__link" href="${assessPaths.assessments.pages.show({
            id: 'some-uuid',
            task: 'second-task',
            page: 'foo',
          })}" aria-describedby="second-task-status" data-cy-task-name="second-task">Complete Second Task</a>`,
        )
      })

      it('should return the task name when the task cannot be started', () => {
        task.status = 'cannot_start'

        expect(taskLink(task, assessment)).toEqual('Complete Second Task')
      })
    })
  })

  describe('statusTag', () => {
    it('returns a Complete text when the task is complete', () => {
      task.status = 'complete'

      expect(statusTag(task)).toEqual('Completed')
    })

    it('returns an in progress tag when the task is in progress', () => {
      task.status = 'in_progress'

      expect(statusTag(task)).toEqual('<strong class="govuk-tag govuk-tag--light-blue">In progress</strong>')
    })

    it('returns a not started tag when the task has not been started', () => {
      task.status = 'not_started'

      expect(statusTag(task)).toEqual('<strong class="govuk-tag govuk-tag--blue">Not started</strong>')
    })

    it('returns a cannot start text when the task cannot be started', () => {
      task.status = 'cannot_start'

      expect(statusTag(task)).toEqual('Cannot start yet')
    })
  })
})
