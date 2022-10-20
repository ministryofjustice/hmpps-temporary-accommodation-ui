import type { Task, FormSections, FormSection } from '@approved-premises/ui'
import type { Application } from '@approved-premises/api'
import paths from '../paths/apply'

const taskIsComplete = (task: Task, application: Application): boolean => {
  return application.data[task.id]
}

const getTaskStatus = (task: Task, application: Application): string => {
  if (!taskIsComplete(task, application)) {
    return `<strong class="govuk-tag govuk-tag--grey app-task-list__tag" id="${task.id}-status">Not started</strong>`
  }
  return `<strong class="govuk-tag app-task-list__tag" id="${task.id}-status">Completed</strong>`
}

const getCompleteSectionCount = (sections: FormSections, application: Application): number => {
  return sections.filter((section: FormSection) => {
    return section.tasks.filter((task: Task) => taskIsComplete(task, application)).length === section.tasks.length
  }).length
}

const taskLink = (task: Task, applicationId: string): string => {
  const firstPage = Object.keys(task.pages)[0]

  return `<a href="${paths.applications.pages.show({
    id: applicationId,
    task: task.id,
    page: firstPage,
  })}" aria-describedby="eligibility-${task.id}" data-cy-task-name="${task.id}">${task.title}</a>`
}

export { getTaskStatus, taskLink, getCompleteSectionCount }
