import type { TableRow, PageResponse } from '@approved-premises/ui'
import type {
  ApprovedPremisesApplication as Application,
  ApprovedPremisesAssessment as Assessment,
} from '@approved-premises/api'
import paths from '../paths/apply'
import Apply from '../form-pages/apply'
import { SessionDataError, UnknownPageError } from './errors'
import { isApplicableTier, tierBadge } from './personUtils'
import { DateFormats } from './dateUtils'
import { TasklistPageInterface } from '../form-pages/tasklistPage'
import Assess from '../form-pages/assess'
import isAssessment from './assessments/isAssessment'

const dashboardTableRows = (applications: Array<Application>): Array<TableRow> => {
  return applications.map(application => {
    const arrivalDate = getArrivalDate(application, false)

    return [
      createNameAnchorElement(application.person.name, application.id),
      textValue(application.person.crn),
      htmlValue(tierBadge(application.risks.tier.value?.level || '')),
      textValue(arrivalDate ? DateFormats.isoDateToUIDate(arrivalDate, { format: 'short' }) : 'N/A'),
      htmlValue(getStatus(application)),
    ]
  })
}

const getStatus = (application: Application): string => {
  switch (application.status) {
    case 'submitted':
      return `<strong class="govuk-tag">Submitted</strong>`
    case 'requestedFurtherInformation':
      return `<strong class="govuk-tag govuk-tag--yellow">Info Request</strong>`
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

const getPage = (taskName: string, pageName: string, isAnAssessment?: boolean): TasklistPageInterface => {
  const pageList = isAnAssessment ? Assess.pages[taskName] : Apply.pages[taskName]

  const Page = pageList[pageName]

  if (!Page) {
    throw new UnknownPageError(pageName)
  }

  return Page as TasklistPageInterface
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
  if (isApplicableTier(application.person.sex, application.risks.tier.value.level)) {
    return paths.applications.pages.show({ id: application.id, task: 'basic-information', page: 'sentence-type' })
  }

  return paths.applications.pages.show({ id: application.id, task: 'basic-information', page: 'is-exceptional-case' })
}

export {
  getResponses,
  getResponseForPage,
  getPage,
  getArrivalDate,
  dashboardTableRows,
  firstPageOfApplicationJourney,
  isUnapplicable,
  getStatus,
}
