import type { Application, TaskNames } from 'approved-premises'
import pages from '../form-pages/apply'
import taskLookup from '../i18n/en/tasks.json'
import paths from '../paths/apply'

const getTaskStatus = (task: TaskNames, application: Application): string => {
  if (!application.data[task]) {
    return `<strong class="govuk-tag govuk-tag--grey app-task-list__tag" id="${task}-status">Not started</strong>`
  }
  return `<strong class="govuk-tag app-task-list__tag" id="${task}-status">Completed</strong>`
}

const taskLink = (task: TaskNames, id: string): string => {
  const firstPage = Object.keys(pages[task])[0]

  return `<a href="${paths.applications.pages.show({
    id,
    task,
    page: firstPage,
  })}" aria-describedby="eligibility-${task}" data-cy-task-name="${task}">${taskLookup[task]}</a>`
}

export { getTaskStatus, taskLink }
