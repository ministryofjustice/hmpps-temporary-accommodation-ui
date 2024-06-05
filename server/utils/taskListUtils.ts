import type { TaskWithStatus } from '@approved-premises/ui'
import {
  TemporaryAccommodationApplication as Application,
  TemporaryAccommodationAssessment as Assessment,
} from '../@types/shared'
import applyPaths from '../paths/apply'
import assessPaths from '../paths/assess'
import isAssessment from './assessments/isAssessment'

export const statusTag = (task: TaskWithStatus): string => {
  switch (task.status) {
    case 'complete':
      return 'Completed'
    case 'in_progress':
      return `<strong class="govuk-tag govuk-tag--light-blue">In progress</strong>`
    case 'not_started':
      return `<strong class="govuk-tag govuk-tag--blue">Not started</strong>`
    default:
      return 'Cannot start yet'
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

    return `<a class="govuk-link govuk-task-list__link" href="${link}" aria-describedby="${task.id}-status" data-cy-task-name="${task.id}">${task.actionText}</a>`
  }
  return task.actionText
}
