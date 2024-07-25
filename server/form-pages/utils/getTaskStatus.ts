import {
  TemporaryAccommodationApplication as Application,
  TemporaryAccommodationAssessment as Assessment,
} from '@approved-premises/api'
import type { Task, TaskStatus } from '@approved-premises/ui'

const getPageData = (applicationOrAssessment: Application | Assessment, taskName: string, pageName: string) => {
  return applicationOrAssessment.data?.[taskName]?.[pageName]
}

const getTaskStatus = (task: Task, applicationOrAssessment: Application | Assessment): TaskStatus => {
  const pageStatuses: Array<TaskStatus> = []
  const pageIds = Object.keys(task.pages)
  let pageId = pageIds?.[0]

  while (pageId) {
    const pageData = getPageData(applicationOrAssessment, task.id, pageId)
    let pageStatus: TaskStatus = 'not_started'

    if (pageData) {
      const Page = task.pages[pageId]
      const page = new Page(pageData, applicationOrAssessment)

      pageStatus = Object.keys(page.errors()).length ? 'in_progress' : 'complete'

      pageId = pageStatus === 'complete' ? page.next() : null
    } else {
      // Check subsequent pages for any data
      pageStatus = pageIds.some(progessTestPageId => !!getPageData(applicationOrAssessment, task.id, progessTestPageId))
        ? 'in_progress'
        : 'not_started'

      pageId = null
    }

    pageStatuses.push(pageStatus)
  }

  if (pageStatuses.every(status => status === 'not_started')) {
    return 'not_started'
  }

  if (pageStatuses.every(status => status === 'complete')) {
    return 'complete'
  }

  return 'in_progress'
}

export default getTaskStatus
