import type { Task } from '@approved-premises/ui'

import applicationFactory from '../testutils/factories/application'
import paths from '../paths/apply'
import { taskLink, getTaskStatus } from './applicationUtils'

describe('applicationUtils', () => {
  describe('getTaskStatus', () => {
    it('returns a not started tag when the task is incomplete', () => {
      const application = applicationFactory.build()

      expect(getTaskStatus('basic-information', application)).toEqual(
        '<strong class="govuk-tag govuk-tag--grey app-task-list__tag" id="basic-information-status">Not started</strong>',
      )
    })

    it('returns a completed tag when the task is complete', () => {
      const application = applicationFactory.build({ data: { 'basic-information': { foo: 'bar' } } })

      expect(getTaskStatus('basic-information', application)).toEqual(
        '<strong class="govuk-tag app-task-list__tag" id="basic-information-status">Completed</strong>',
      )
    })
  })

  describe('taskLink', () => {
    it('should return a link to a task', () => {
      const task = {
        id: 'type-of-ap',
        title: 'Type of Approved Premises required',
        pages: { foo: 'bar', bar: 'baz' },
      } as Task

      expect(taskLink(task, 'some-uuid')).toEqual(
        `<a href="${paths.applications.pages.show({
          id: 'some-uuid',
          task: 'type-of-ap',
          page: 'foo',
        })}" aria-describedby="eligibility-type-of-ap" data-cy-task-name="type-of-ap">Type of Approved Premises required</a>`,
      )
    })
  })
})
