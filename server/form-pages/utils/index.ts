import type { Request } from 'express'
import {
  FormPages,
  FormSection,
  FormSections,
  JourneyType,
  PageResponse,
  Task,
  TaskPages,
  UIPersonAcctAlert,
  YesNoOrIDK,
  YesOrNo,
  YesOrNoWithDetail,
} from '@approved-premises/ui'
import {
  Adjudication,
  TemporaryAccommodationApplication as Application,
  TemporaryAccommodationAssessment as Assessment,
  PersonRisks,
} from '../../@types/shared'
import { SessionDataError } from '../../utils/errors'
import { kebabCase, sentenceCase } from '../../utils/utils'
import TasklistPage, { TasklistPageInterface } from '../tasklistPage'

export type PageBodyAdjudication = {
  id: number
  reportedAt: string
  establishment: string
  offenceDescription: string
  hearingHeld: boolean
  finding: string
}

export type PageBodyPersonAcctAlert = {
  alertId: string | number
  comment?: string
  dateCreated: string
  dateExpires: string
}

export type BodyWithYesOrNo<K extends string> = { [T in K]?: YesOrNo }
export type BodyWithYesNoOrIDK<K extends string> = { [T in K]?: YesNoOrIDK }
export type BodyWithYesOrNoWithDetail<K extends string> = BodyWithYesOrNo<K> & { [T in K as `${T}Detail`]?: string }
export type BodyWithYesNoOrIDKWithDetail<K extends string> = BodyWithYesNoOrIDK<K> & {
  [T in K as `${T}Detail`]?: string
}

export const applyYesOrNo = <K extends string>(key: K, body: Record<string, unknown>): YesOrNoWithDetail<K> => {
  return {
    [`${key}`]: body[`${key}`] as YesOrNo,
    [`${key}Detail`]: body[`${key}Detail`] as string,
  } as YesOrNoWithDetail<K>
}

export const yesOrNoResponseWithDetail = <K extends string>(key: K, body: BodyWithYesOrNoWithDetail<K>) => {
  return body[key] === 'yes' ? `Yes - ${body[`${key}Detail` as K]}` : 'No'
}

export const yesNoOrDontKnowResponseWithDetail = <K extends string>(key: K, body: BodyWithYesNoOrIDKWithDetail<K>) => {
  return body[key] === 'iDontKnow'
    ? "Don't know"
    : yesOrNoResponseWithDetail<K>(key, body as BodyWithYesOrNoWithDetail<K>)
}

export const yesNoOrDontKnowResponse = <K extends string>(key: K, body: BodyWithYesNoOrIDK<K>) => {
  return body[key] === 'iDontKnow' ? "Don't know" : sentenceCase(body[key])
}

export const getTask = <T>(task: T): Task => {
  const taskPages: TaskPages = {}
  const slug = Reflect.getMetadata('task:slug', task)
  const name = Reflect.getMetadata('task:name', task)
  const actionText = Reflect.getMetadata('task:actionText', task)
  const pageClasses: Array<FormPages> = Reflect.getMetadata('task:pages', task)

  pageClasses.forEach(page => {
    const pageName = Reflect.getMetadata('page:name', page)
    taskPages[pageName] = page as unknown as TasklistPageInterface
  })

  return {
    id: slug,
    title: name,
    actionText,
    pages: taskPages,
  }
}

export const getSection = (section: unknown): FormSection => {
  const tasks: Array<Task> = []
  const title = Reflect.getMetadata('section:title', section)
  const name = Reflect.getMetadata('section:name', section)
  const taskClasses: Array<TasklistPageInterface> = Reflect.getMetadata('section:tasks', section)

  taskClasses.forEach(taskClass => {
    tasks.push(getTask(taskClass))
  })

  return {
    title,
    name,
    tasks,
  }
}

export const getFormPages = (sections: FormSections) => {
  const pages: FormPages = {}

  sections.forEach(sectionClass => {
    const section = getSection(sectionClass)
    const { tasks } = section
    tasks.forEach(t => {
      pages[t.id] = t.pages
    })
  })

  return pages
}

export const getFormSections = (sections: FormSections): FormSections => {
  return sections.map(s => getSection(s))
}

export const viewPath = (section: FormSection, task: Task, page: TasklistPage, journeyType: JourneyType) => {
  const pageName = getPageName(page.constructor)

  return `${journeyType}/pages/${kebabCase(section.name)}/${task.id}/${pageName}`
}

export const getPageName = <T>(page: T) => {
  return Reflect.getMetadata('page:name', page)
}

export const getTaskName = <T>(page: T) => {
  return Reflect.getMetadata('page:task', page)
}

export const updateAssessmentData = (page: TasklistPage, assessment: Assessment): Assessment => {
  const pageName = getPageName(page.constructor)
  const taskName = getTaskName(page.constructor)

  assessment.data = assessment.data || {}
  assessment.data[taskName] = assessment.data[taskName] || {}
  assessment.data[taskName][pageName] = page.body

  return assessment
}

export function getBody(
  Page: TasklistPageInterface,
  application: Application | Assessment,
  request: Request,
  userInput: Record<string, unknown>,
) {
  if (userInput && Object.keys(userInput).length) {
    return userInput
  }
  if (Object.keys(request.body).length) {
    return request.body
  }
  return getPageDataFromApplication(Page, application)
}

export function getPageDataFromApplication(Page: TasklistPageInterface, application: Application | Assessment) {
  const pageName = getPageName(Page)
  const taskName = getTaskName(Page)

  return application.data?.[taskName]?.[pageName] || {}
}

export const responsesForYesNoAndCommentsSections = (
  sections: Record<string, string>,
  body: Record<string, string>,
) => {
  return Object.keys(sections).reduce((prev, section) => {
    const response: Record<string, unknown> = {
      ...prev,
      [sections[section]]: sentenceCase(body[section]),
    }

    if (body[`${section}Comments`]) {
      response[`${sections[section]} Additional comments`] = body[`${section}Comments`]
    }

    return response
  }, {})
}

export const getProbationPractitionerName = (application: Application) => {
  const name: string = application.data?.['contact-details']?.['probation-practitioner']?.name

  if (!name) {
    throw new SessionDataError('No probation practitioner name')
  }

  return name
}

export const hasSubmittedDtr = (application: Application): boolean => {
  const dtrSubmitted: YesOrNo = application.data?.['accommodation-referral-details']?.['dtr-submitted']?.dtrSubmitted

  if (!dtrSubmitted) {
    throw new SessionDataError('No DTR submitted value')
  }

  return dtrSubmitted === 'yes'
}

export const arrivalDateFromApplication = (application: Application): string => {
  const dateOfArrival: string =
    application.data?.eligibility?.['accommodation-required-from-date']?.accommodationRequiredFromDate

  if (!dateOfArrival) {
    throw new SessionDataError('No arrival date')
  }

  return dateOfArrival
}

export const dateBodyProperties = (root: string) => {
  return [root, `${root}-year`, `${root}-month`, `${root}-day`]
}

export const pageBodyShallowEquals = (body1: Record<string, unknown>, body2: Record<string, unknown>) => {
  const body1Keys = Object.keys(body1)
  const body2Keys = Object.keys(body2)

  if (body1Keys.length !== body2Keys.length) {
    return false
  }

  return body1Keys.every(key => {
    const value1 = body1[key]
    const value2 = body2[key]

    if (Array.isArray(value1) && Array.isArray(value2)) {
      return value1.length === value2.length && value1.every((arrayValue, index) => arrayValue === value2[index])
    }
    return value1 === value2
  })
}

export const mapAdjudicationsForPageBody = (adjudications: Array<Adjudication>): Array<PageBodyAdjudication> => {
  return adjudications.map(adjudication => ({
    id: adjudication.id,
    reportedAt: adjudication.reportedAt,
    establishment: adjudication.establishment,
    offenceDescription: adjudication.offenceDescription,
    hearingHeld: adjudication.hearingHeld,
    finding: adjudication.finding || '',
  }))
}

export const mapAcctAlertsForPageBody = (acctAlerts: Array<UIPersonAcctAlert>): Array<UIPersonAcctAlert> => {
  return acctAlerts.map(acctAlert => ({
    alertTypeDescription: acctAlert.alertTypeDescription || acctAlert.alertId,
    description: acctAlert.description || acctAlert.comment || '',
    dateCreated: acctAlert.dateCreated,
    dateExpires: acctAlert.dateExpires || '',
  })) as unknown as Array<UIPersonAcctAlert>
}

export const personRisksRoshResponse = (risks: PersonRisks): PageResponse => {
  if (risks?.roshRisks?.status === 'retrieved') {
    const { value } = risks.roshRisks

    return {
      'Risk of serious harm': [
        {
          'Overall risk of serious harm': sentenceCase(value?.overallRisk) || 'Not known',
          'Risk to children': sentenceCase(value?.riskToChildren) || 'Not known',
          'Risk to public': sentenceCase(value?.riskToPublic) || 'Not known',
          'Risk to known adult': sentenceCase(value?.riskToKnownAdult) || 'Not known',
          'Risk to staff': sentenceCase(value?.riskToStaff) || 'Not known',
        },
      ],
    }
  }
  return {
    'Risk of serious harm':
      'We were unable to automatically import RoSH information. Check the "Placement considerations" section to find the OASys risk levels. If the risk levels are not present, they must be checked manually outside of this service.',
  }
}

export const personRisksMappaResponse = (risks: PersonRisks): PageResponse => {
  if (risks?.mappa?.status === 'retrieved') {
    const { value } = risks.mappa

    return {
      'Multi-agency public protection arrangements': value?.level || 'Not known',
    }
  }
  return {
    'Multi-agency public protection arrangements':
      'Something went wrong. We are unable to include MAPPA information. This risk data must be checked manually outside of this service.',
  }
}

export const personRisksFlagsResponse = (risks: PersonRisks): PageResponse => {
  if (risks?.flags?.status === 'retrieved') {
    const { value } = risks.flags

    return {
      'NDelius risk flags (registers)': value?.length === 0 ? 'No flags' : value?.join('\n') || 'Not known',
    }
  }
  return {
    'NDelius risk flags (registers)':
      'Something went wrong. We are unable to include risk flags. This risk data must be checked manually outside of this service.',
  }
}
