import {
  TemporaryAccommodationApplication as Application,
  TemporaryAccommodationAssessment as Assessment,
} from '@approved-premises/api'
import type { Task, TaskStatus } from '@approved-premises/ui'
import { TasklistPageInterface } from '../tasklistPage'

const getPageData = (applicationOrAssessment: Application | Assessment, taskName: string, pageName: string) => {
  return applicationOrAssessment.data?.[taskName]?.[pageName]
}

const getTaskStatus = (task: Task, applicationOrAssessment: Application | Assessment): TaskStatus => {
  const pageIds = Object.keys(task.pages)
  let pageId = pageIds?.[0]

  while (pageId) {
    const pageData = getPageData(applicationOrAssessment, task.id, pageId)

    // If there's no page data for this page, then we know the task is incomplete
    if (!pageData) {
      return pageIds.some(progessTestPageId => !!getPageData(applicationOrAssessment, task.id, progessTestPageId))
        ? 'in_progress'
        : 'not_started'
    }

    const Page = task.pages[pageId] as TasklistPageInterface
    const page = new Page(pageData, applicationOrAssessment)

    // If there's errors for this page, then we know the task incomplete
    if (Object.keys(page.errors()).length) {
      return 'in_progress'
    }

    pageId = page.next()
  }

  return 'complete'
}

export default getTaskStatus
