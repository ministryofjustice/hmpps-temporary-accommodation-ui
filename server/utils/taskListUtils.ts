import type { TaskWithStatus } from '@approved-premises/ui'
import { ApprovedPremisesApplication as Application, ApprovedPremisesAssessment as Assessment } from '../@types/shared'
import applyPaths from '../paths/apply'
import assessPaths from '../paths/assess'
import isAssessment from './assessments/isAssessment'

export const statusTag = (task: TaskWithStatus): string => {
  switch (task.status) {
    case 'complete':
      return `<strong class="govuk-tag app-task-list__tag" id="${task.id}-status">Completed</strong>`
    case 'in_progress':
      return `<strong class="govuk-tag govuk-tag--blue app-task-list__tag" id="${task.id}-status">In progress</strong>`
    case 'not_started':
      return `<strong class="govuk-tag govuk-tag--grey app-task-list__tag" id="${task.id}-status">Not started</strong>`
    default:
      return `<strong class="govuk-tag govuk-tag--grey app-task-list__tag" id="${task.id}-status">Cannot start yet</strong>`
  }
}

export const taskLink = (task: TaskWithStatus, applicationOrAssessment: Application | Assessment): string => {
  if (task.status !== 'cannot_start') {
    const firstPage = Object.keys(task.pages)[0]

    const link = isAssessment(applicationOrAssessment)
      ? assessPaths.assessments.pages.show({
          id: applicationOrAssessment.id,
          task: task.id,
          page: firstPage,
        })
      : applyPaths.applications.pages.show({
          id: applicationOrAssessment.id,
          task: task.id,
          page: firstPage,
        })

    return `<a href="${link}" aria-describedby="eligibility-${task.id}" data-cy-task-name="${task.id}">${task.title}</a>`
  }
  return task.title
}
