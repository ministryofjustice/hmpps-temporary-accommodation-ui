import pages, { TaskNames, Application } from '../form-pages/apply'
import taskLookup from '../i18n/en/tasks.json'

const getTaskStatus = (task: TaskNames, application: Application): string => {
  if (!application[task]) {
    return `<strong class="govuk-tag govuk-tag--grey app-task-list__tag" id="${task}-status">Not started</strong>`
  }
  return `<strong class="govuk-tag app-task-list__tag" id="${task}-status">Completed</strong>`
}

const taskLink = (task: TaskNames, id: string): string => {
  const firstPage = Object.keys(pages[task])[0]
  return `<a href="/applications/${id}/tasks/${task}/pages/${firstPage}" aria-describedby="eligibility-${task}" data-cy-task-name="${task}">${taskLookup[task]}</a>`
}

export { getTaskStatus, taskLink }
