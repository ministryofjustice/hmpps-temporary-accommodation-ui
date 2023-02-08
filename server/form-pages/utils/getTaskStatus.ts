import type { TaskStatus, Task } from '@approved-premises/ui'
import {
  ApprovedPremisesApplication as Application,
  ApprovedPremisesAssessment as Assessment,
} from '@approved-premises/api'
import { TasklistPageInterface } from '../tasklistPage'

const getPageData = (applicationOrAssessment: Application | Assessment, taskName: string, pageName: string) => {
  return applicationOrAssessment.data?.[taskName]?.[pageName]
}

const getTaskStatus = (task: Task, applicationOrAssessment: Application | Assessment): TaskStatus => {
  // Find the first page that has an answer
  let pageId = Object.keys(task.pages).find(
    (pageName: string) => !!getPageData(applicationOrAssessment, task.id, pageName),
  )

  let status: TaskStatus

  // If there's no page that's been completed, then we know the task is incomplete
  if (!pageId) {
    return 'not_started'
  }

  while (pageId) {
    const pageData = getPageData(applicationOrAssessment, task.id, pageId)

    // If there's no page data for this page, then we know it's incomplete
    if (!pageData) {
      status = 'in_progress'
      break
    }

    // Let's initialize this page
    const Page = task.pages[pageId] as TasklistPageInterface
    const page = new Page(pageData, applicationOrAssessment)

    // Get the errors for this page
    const errors = page.errors()
    // And the next page ID
    pageId = page.next()

    if (errors.length) {
      // Are there any errors? Then the task is incomplete
      status = 'in_progress'
      break
    }

    if (!pageId) {
      // Is the next page blank? Then the task is complete
      status = 'complete'
      break
    }

    // If none of the above is true, we loop round again!
  }

  return status
}

export default getTaskStatus
