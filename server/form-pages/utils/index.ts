import type { JourneyType, Task, YesOrNo, YesOrNoWithDetail } from '@approved-premises/ui'
import type { Request } from 'express'
import TasklistPage, { TasklistPageInterface } from '../tasklistPage'
import { ApprovedPremisesApplication, ApprovedPremisesAssessment } from '../../@types/shared'
import { sentenceCase } from '../../utils/utils'

export const applyYesOrNo = <K extends string>(key: K, body: Record<string, unknown>): YesOrNoWithDetail<K> => {
  return {
    [`${key}`]: body[`${key}`] as YesOrNo,
    [`${key}Detail`]: body[`${key}Detail`] as string,
  } as YesOrNoWithDetail<K>
}

export const yesOrNoResponseWithDetail = <K extends string>(key: K, body: Record<string, string>) => {
  return body[key] === 'yes' ? `Yes - ${body[`${key}Detail`]}` : 'No'
}

export const yesNoOrDontKnowResponseWithDetail = <K extends string>(key: K, body: Record<string, string>) => {
  return body[key] === 'iDontKnow' ? "Don't know" : yesOrNoResponseWithDetail<K>(key, body)
}

export const getTask = <T>(task: T) => {
  const taskPages = {}
  const slug = Reflect.getMetadata('task:slug', task)
  const name = Reflect.getMetadata('task:name', task)
  const pageClasses = Reflect.getMetadata('task:pages', task)

  pageClasses.forEach(<PageType>(page: PageType) => {
    const pageName = Reflect.getMetadata('page:name', page)
    taskPages[pageName] = page
  })

  return {
    id: slug,
    title: name,
    pages: taskPages,
  }
}

export const getSection = <T>(section: T) => {
  const tasks: Array<Task> = []
  const title = Reflect.getMetadata('section:title', section)
  const name = Reflect.getMetadata('section:name', section)
  const taskClasses = Reflect.getMetadata('section:tasks', section)

  taskClasses.forEach(<PageType>(task: PageType) => {
    tasks.push(getTask(task))
  })

  return {
    title,
    name,
    tasks,
  }
}

export const getPagesForSections = <T>(sections: Array<T>) => {
  const pages = {}
  sections.forEach(sectionClass => {
    const section = getSection(sectionClass)
    const { tasks } = section
    tasks.forEach(t => {
      pages[t.id] = t.pages
    })
  })
  return pages
}

export const viewPath = <T>(page: T, journeyType: JourneyType) => {
  const pageName = getPageName(page.constructor)
  const taskName = getTaskName(page.constructor)

  return `${journeyType}/pages/${taskName}/${pageName}`
}

export const getPageName = <T>(page: T) => {
  return Reflect.getMetadata('page:name', page)
}

export const getTaskName = <T>(page: T) => {
  return Reflect.getMetadata('page:task', page)
}

export const updateAssessmentData = (
  page: TasklistPage,
  assessment: ApprovedPremisesAssessment,
): ApprovedPremisesAssessment => {
  const pageName = getPageName(page.constructor)
  const taskName = getTaskName(page.constructor)

  assessment.data = assessment.data || {}
  assessment.data[taskName] = assessment.data[taskName] || {}
  assessment.data[taskName][pageName] = page.body

  return assessment
}

export function getBody(
  Page: TasklistPageInterface,
  application: ApprovedPremisesApplication | ApprovedPremisesAssessment,
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

export function getPageDataFromApplication(
  Page: TasklistPageInterface,
  application: ApprovedPremisesApplication | ApprovedPremisesAssessment,
) {
  const pageName = getPageName(Page)
  const taskName = getTaskName(Page)

  return application.data?.[taskName]?.[pageName] || {}
}

export const responsesForYesNoAndCommentsSections = (
  sections: Record<string, string>,
  body: Record<string, string>,
) => {
  return Object.keys(sections).reduce((prev, section) => {
    const response = {
      ...prev,
      [sections[section]]: sentenceCase(body[section]),
    }

    if (body[`${section}Comments`]) {
      response[`${sections[section]} Additional comments`] = body[`${section}Comments`]
    }

    return response
  }, {})
}
