import type { Task, TaskNames } from '@approved-premises/ui'
import type { Application } from '@approved-premises/api'
import paths from '../paths/apply'

const getTaskStatus = (task: TaskNames, application: Application): string => {
  if (!application.data[task]) {
    return `<strong class="govuk-tag govuk-tag--grey app-task-list__tag" id="${task}-status">Not started</strong>`
  }
  return `<strong class="govuk-tag app-task-list__tag" id="${task}-status">Completed</strong>`
}

const taskLink = (task: Task, applicationId: string): string => {
  const firstPage = Object.keys(task.pages)[0]

  return `<a href="${paths.applications.pages.show({
    id: applicationId,
    task: task.id,
    page: firstPage,
  })}" aria-describedby="eligibility-${task.id}" data-cy-task-name="${task.id}">${task.title}</a>`
}

export { getTaskStatus, taskLink }
