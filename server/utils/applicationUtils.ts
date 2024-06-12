import type {
  TemporaryAccommodationApplication as Application,
  TemporaryAccommodationAssessment as Assessment,
} from '@approved-premises/api'
import type {
  FormSection,
  PageResponse,
  SummaryListActionItem,
  SummaryListItem,
  TableRow,
  Task,
} from '@approved-premises/ui'
import Apply from '../form-pages/apply'
import Assess from '../form-pages/assess'
import TasklistPage, { TasklistPageInterface } from '../form-pages/tasklistPage'
import paths from '../paths/apply'
import getSections from './assessments/getSections'
import isAssessment from './assessments/isAssessment'
import { DateFormats } from './dateUtils'
import { SessionDataError, UnknownPageError, UnknownTaskError } from './errors'
import { personName } from './personUtils'
import { formatLines } from './viewUtils'
import { embeddedSummaryListItem } from './checkYourAnswersUtils/embeddedSummaryListItem'

const dashboardTableRows = (applications: Array<Application>): Array<TableRow> => {
  return applications.map(application => {
    if (application.status === 'submitted') {
      return [
        createNameAnchorElement(personName(application.person, 'Limited access offender'), application),
        textValue(application.person.crn),
        textValue(
          application.submittedAt ? DateFormats.isoDateToUIDate(application.submittedAt, { format: 'short' }) : 'N/A',
        ),
        htmlValue(getStatus(application)),
      ]
    }

    return [
      createNameAnchorElement(personName(application.person, 'Limited access offender'), application),
      textValue(application.person.crn),
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

const createNameAnchorElement = (name: string, application: Application) => {
  return application.status === 'submitted'
    ? htmlValue(`<a href=${paths.applications.full({ id: application.id })}>${name}</a>`)
    : htmlValue(`<a href=${paths.applications.show({ id: application.id })}>${name}</a>`)
}

export type ApplicationOrAssessmentResponse = Record<string, Array<PageResponse>>

export type Section = { title: string; tasks: Array<TaskResponse> }

type TaskResponse = {
  title: string
  id: string
  content: Array<PageResponse>
}

const getResponses = (applicationOrAssessment: Application | Assessment): ApplicationOrAssessmentResponse => {
  const responses: { sections: Array<Section> } = { sections: [] }

  const formSections = getSections(applicationOrAssessment, true)

  formSections.forEach(section => {
    const sectionResponses: Section = { title: section.title, tasks: [] }

    section.tasks.forEach(task => {
      const responsesForTask: Array<PageResponse> = []

      forPagesInTask(applicationOrAssessment, task, page => responsesForTask.push(page.response()))

      if (responsesForTask.length) {
        sectionResponses.tasks.push({
          title: task.title,
          id: task.id,
          content: responsesForTask,
        })
      }
    })
    if (sectionResponses.tasks.length) {
      responses.sections.push(sectionResponses)
    }
  })

  return responses
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

    if (!body) {
      throw new SessionDataError(`No data for page ${task.id}:${pageName}`)
    }

    const page = new Page(body, applicationOrAssessment)

    if (Object.keys(page.errors()).length) {
      throw new SessionDataError(`Errors for page ${task.id}:${pageName}`)
    }

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

const firstPageOfApplicationJourney = (application: Application) => {
  return paths.applications.show({ id: application.id })
}

const taskResponsesToSummaryListRowItems = (
  taskResponses: TaskResponse['content'],
  actions?: Record<string, SummaryListActionItem[]>,
): SummaryListItem[] => {
  return taskResponses
    .map(taskResponse => {
      return Object.entries(taskResponse).map(([key, value]) => {
        const actionItems = actions?.[key]
        return {
          key: { text: key },
          value: {
            html:
              typeof value === 'string' || value instanceof String
                ? formatLines(value as string)
                : embeddedSummaryListItem(value as Array<Record<string, unknown>>),
          },
          actions: actionItems ? { items: actionItems } : undefined,
        }
      })
    })
    .flat()
}

export {
  createNameAnchorElement,
  dashboardTableRows,
  firstPageOfApplicationJourney,
  forPagesInTask,
  getPage,
  getResponses,
  getSectionAndTask,
  getStatus,
  taskResponsesToSummaryListRowItems,
}
