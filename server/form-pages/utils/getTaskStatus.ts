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

  // console.debug('getTaskStatus: Starting for task', task.id)
  // console.debug('getTaskStatus: pageIds', pageIds)

  while (pageId) {
    const pageData = getPageData(applicationOrAssessment, task.id, pageId)
    let pageStatus: TaskStatus = 'not_started'

    // console.debug(`getTaskStatus: Checking pageId "${pageId}"`)
    // console.debug('getTaskStatus: pageData', pageData)

    if (pageData && Object.keys(pageData).length > 0) {
      const Page = task.pages[pageId]
      const page = new Page(pageData, applicationOrAssessment)

      const errors = page.errors()
      pageStatus = Object.keys(errors).length ? 'in_progress' : 'complete'

      // console.debug(`getTaskStatus: pageStatus for "${pageId}" is "${pageStatus}"`)
      if (pageStatus === 'complete') {
        pageId = page.next()
        // console.debug(`getTaskStatus: Next pageId is "${pageId}"`)
      } else {
        pageId = null
      }
    } else {
      // Check subsequent pages for any data
      pageStatus = pageIds.some(progessTestPageId => !!getPageData(applicationOrAssessment, task.id, progessTestPageId))
        ? 'in_progress'
        : 'not_started'

      // console.debug(`getTaskStatus: No data for "${pageId}", pageStatus is "${pageStatus}"`)
      pageId = null
    }

    pageStatuses.push(pageStatus)
  }

  // console.debug('getTaskStatus: pageStatuses', pageStatuses)

  if (pageStatuses.every(status => status === 'not_started')) {
    return 'not_started'
  }

  if (pageStatuses.every(status => status === 'complete')) {
    return 'complete'
  }

  return 'in_progress'
}

export default getTaskStatus
