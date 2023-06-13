import type {
  TemporaryAccommodationApplication as Application,
  ApprovedPremisesAssessment as Assessment,
} from '@approved-premises/api'
import type { FormSection, PageResponse, TableRow, Task } from '@approved-premises/ui'
import Apply from '../form-pages/apply'
import Assess from '../form-pages/assess'
import TasklistPage, { TasklistPageInterface } from '../form-pages/tasklistPage'
import paths from '../paths/apply'
import isAssessment from './assessments/isAssessment'
import { DateFormats } from './dateUtils'
import { SessionDataError, UnknownPageError, UnknownTaskError } from './errors'

const dashboardTableRows = (applications: Array<Application>): Array<TableRow> => {
  return applications.map(application => {
    const arrivalDate = getArrivalDate(application, false)

    return [
      createNameAnchorElement(application.person.name, application.id),
      textValue(application.person.crn),
      textValue(arrivalDate ? DateFormats.isoDateToUIDate(arrivalDate, { format: 'short' }) : 'N/A'),
      htmlValue(getStatus(application)),
    ]
  })
}

const getStatus = (application: Application): string => {
  switch (application.status) {
    case 'submitted':
      return `<strong class="govuk-tag">Submitted</strong>`
    default:
      return `<strong class="govuk-tag govuk-tag--blue">In Progress</strong>`
  }
}

const textValue = (value: string) => {
  return { text: value }
}

const htmlValue = (value: string) => {
  return { html: value }
}

const createNameAnchorElement = (name: string, applicationId: string) => {
  return htmlValue(`<a href=${paths.applications.show({ id: applicationId })}>${name}</a>`)
}

export type ApplicationOrAssessmentResponse = Record<string, Array<PageResponse>>

const getResponses = (applicationOrAssessment: Application | Assessment): ApplicationOrAssessmentResponse => {
  const responses = {}

  Object.keys(applicationOrAssessment.data).forEach(taskName => {
    responses[taskName] = getResponsesForTask(applicationOrAssessment, taskName)
  })

  return responses
}

const getResponsesForTask = (
  applicationOrAssessment: Application | Assessment,
  taskName: string,
): Array<PageResponse> => {
  const pageNames = Object.keys(applicationOrAssessment.data[taskName])
  const responsesForPages = pageNames.map(pageName => getResponseForPage(applicationOrAssessment, taskName, pageName))
  return responsesForPages
}

const getResponseForPage = (
  applicationOrAssessment: Application | Assessment,
  taskName: string,
  pageName: string,
): PageResponse => {
  const Page = getPage(taskName, pageName, isAssessment(applicationOrAssessment))

  const body = applicationOrAssessment?.data?.[taskName]?.[pageName]
  const page = new Page(body, applicationOrAssessment)

  return page.response()
}

const forPagesInTask = (
  applicationOrAssessment: Application | Assessment,
  task: Task,
  callback: (page: TasklistPage, pageName: string) => void,
): void => {
  const pageNames = Object.keys(task.pages)
  let pageName = pageNames?.[0]

  while (pageName) {
    const Page = getPage(task.id, pageName, isAssessment(applicationOrAssessment))
    const body = applicationOrAssessment?.data?.[task.id]?.[pageName]
    const page = new Page(body, applicationOrAssessment)
    callback(page, pageName)
    pageName = page.next()
  }
}

const getPage = (taskName: string, pageName: string, isAnAssessment?: boolean): TasklistPageInterface => {
  const pageList = isAnAssessment ? Assess.pages[taskName] : Apply.pages[taskName]

  const Page = pageList[pageName]

  if (!Page) {
    throw new UnknownPageError(pageName)
  }

  return Page as TasklistPageInterface
}

const getSectionAndTask = (taskName: string, isAnAssessment?: boolean): { section: FormSection; task: Task } => {
  const sections = isAnAssessment ? Assess.sections : Apply.sections

  let result: { section: FormSection; task: Task }

  sections.every(section => {
    const task = section.tasks.find(sectionTask => sectionTask.id === taskName)

    if (task) {
      result = { section, task }
      return false
    }
    return true
  })

  if (result) {
    return result
  }
  throw new UnknownTaskError(taskName)
}

const getArrivalDate = (application: Application, raiseOnMissing = true): string | null => {
  const throwOrReturnNull = (message: string): null => {
    if (raiseOnMissing) {
      throw new SessionDataError(message)
    }

    return null
  }

  const basicInformation = application.data?.['basic-information']

  if (!basicInformation) return throwOrReturnNull('No basic information')

  const {
    knowReleaseDate = '',
    startDateSameAsReleaseDate = '',
    releaseDate = '',
    startDate = '',
  } = {
    ...basicInformation['release-date'],
    ...basicInformation['placement-date'],
  }

  if (!knowReleaseDate || knowReleaseDate === 'no') {
    return throwOrReturnNull('No known release date')
  }

  if (knowReleaseDate === 'yes' && startDateSameAsReleaseDate === 'yes') {
    if (!releaseDate) {
      return throwOrReturnNull('No release date')
    }

    return releaseDate
  }

  if (startDateSameAsReleaseDate === 'no') {
    if (!startDate) {
      return throwOrReturnNull('No start date')
    }

    return startDate
  }

  return null
}

const isUnapplicable = (application: Application): boolean => {
  const basicInformation = application.data?.['basic-information']
  const isExceptionalCase = basicInformation?.['is-exceptional-case']?.isExceptionalCase

  return isExceptionalCase === 'no'
}

const firstPageOfApplicationJourney = (application: Application) => {
  return paths.applications.show({ id: application.id })
}

export {
  getResponses,
  getResponseForPage,
  forPagesInTask,
  getPage,
  getSectionAndTask,
  getArrivalDate,
  dashboardTableRows,
  firstPageOfApplicationJourney,
  isUnapplicable,
  getStatus,
}
