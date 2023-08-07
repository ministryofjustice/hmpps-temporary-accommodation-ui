import {
  TemporaryAccommodationApplication as Application,
  OASysQuestion,
  OASysSection,
  OASysSections,
} from '../@types/shared'
import { DataServices, OasysImportArrays, OasysPage } from '../@types/ui'
import { CallConfig } from '../data/restClient'
import oasysStubs from '../data/stubs/oasysStubs.json'
import { DateFormats } from './dateUtils'
import { SessionDataError } from './errors'
import { mapApiPersonRisksForUi, sentenceCase } from './utils'
import { escape } from './viewUtils'

export type Constructor<T> = new (body: unknown) => T

export const getOasysSections = async <T extends OasysPage>(
  body: Record<string, unknown>,
  application: Application,
  callConfig: CallConfig,
  dataServices: DataServices,
  constructor: Constructor<T>,
  {
    sectionName,
    summaryKey,
    answerKey,
    selectedSections = [],
  }: {
    sectionName: string
    summaryKey: string
    answerKey: string
    selectedSections?: Array<number>
  },
): Promise<T> => {
  let oasysSections: OASysSections
  let oasysSuccess: boolean

  try {
    oasysSections = await dataServices.personService.getOasysSections(
      callConfig,
      application.person.crn,
      selectedSections,
    )
    oasysSuccess = true
  } catch (e) {
    oasysSections = oasysStubs
    oasysSuccess = false
  }

  oasysSections = filterOasysSections(oasysSections)

  const summaries = sortOasysImportSummaries(oasysSections[sectionName]).map(question => {
    const answer = body[answerKey]?.[`${questionKeyFromNumber(question.questionNumber)}`] || question.answer
    return {
      label: question.label,
      questionNumber: question.questionNumber,
      answer,
    }
  })

  const page = new constructor(body)

  page.body[summaryKey] = summaries
  page[summaryKey] = summaries
  page.body.oasysImported = body.oasysImported || DateFormats.dateObjToIsoDate(new Date())
  page.body.oasysCompleted = body.oasysCompleted || oasysSections?.dateCompleted || oasysSections?.dateStarted
  page.oasysSuccess = oasysSuccess
  page.risks = mapApiPersonRisksForUi(application.risks)

  return page
}

export const validateOasysEntries = <T>(body: Partial<T>, questionKey: string, answerKey: string) => {
  const errors = {}
  const questions = body[questionKey]
  const answers = body[answerKey]

  Object.keys(questions).forEach(key => {
    const question = questions[key]
    if (!answers[`${questionKeyFromNumber(question.questionNumber)}`]) {
      errors[
        `${answerKey}[${questionKeyFromNumber(question.questionNumber)}]`
      ] = `You must enter a response for the '${question.label}' question`
    }
  })

  return errors
}

export const questionKeyFromNumber = (questionNumber: string) => `Q${questionNumber}`

export const questionNumberFromKey = (key: string) => key.substring(1)

export const textareas = (questions: OasysImportArrays, key: 'roshAnswers' | 'offenceDetails') => {
  return questions
    .map(question => {
      return `<div class="govuk-form-group">
                <h3 class="govuk-label-wrapper">
                    <label class="govuk-label govuk-label--m" for=${key}[${questionKeyFromNumber(
                      question.questionNumber,
                    )}]>
                        ${question.label}
                    </label>
                </h3>
                <textarea class="govuk-textarea" id=${key}[${questionKeyFromNumber(
                  question.questionNumber,
                )}] name=${key}[${questionKeyFromNumber(question.questionNumber)}] rows="8">${escape(
                  question?.answer,
                )}</textarea>
            </div>
            <hr>`
    })
    .join('')
}

export const oasysImportReponse = (answers: Record<string, string>, summaries: Array<OASysQuestion>) => {
  return Object.keys(answers).reduce((prev, key) => {
    const questionNumber = questionNumberFromKey(key)

    return {
      ...prev,
      [`${questionNumber}: ${findSummary(questionNumber, summaries).label}`]: answers[`${key}`],
    }
  }, {}) as Record<string, string>
}

const findSummary = (questionNumber: string, summaries: Array<OASysQuestion>) => {
  return summaries.find(i => i.questionNumber === questionNumber)
}

export const fetchOptionalOasysSections = (application: Application): Array<number> => {
  try {
    const oasysImport = application.data['oasys-import']

    if (!oasysImport) throw new SessionDataError('No OASys import section')

    const optionalOasysSections = oasysImport['optional-oasys-sections']

    if (!optionalOasysSections) throw new SessionDataError('No optional OASys imports')

    return [...optionalOasysSections.needsLinkedToReoffending, ...optionalOasysSections.otherNeeds].map(
      (oasysSection: OASysSection) => oasysSection.section,
    )
  } catch (e) {
    throw new SessionDataError(`Oasys supporting information error: ${e}`)
  }
}

export const sortOasysImportSummaries = (summaries: Array<OASysQuestion>): Array<OASysQuestion> => {
  return summaries.sort((a, b) => Number(a.questionNumber) - Number(b.questionNumber))
}

export const sectionCheckBoxes = (fullList: Array<OASysSection>, selectedList: Array<OASysSection>) => {
  return fullList.map(need => {
    const sectionAndName = `${need.section}. ${sentenceCase(need.name)}`
    return {
      value: need.section.toString(),
      text: sectionAndName,
      checked: selectedList.map(n => n.section).includes(need.section),
    }
  })
}

const filterOasysSections = (oasysSections: OASysSections) => {
  const permittedRiskManagementQuestions = ['RM30', 'RM31', 'RM32', 'RM33']

  return {
    ...oasysSections,
    riskManagementPlan: oasysSections.riskManagementPlan.filter(question =>
      permittedRiskManagementQuestions.includes(question.questionNumber),
    ),
  } as OASysSections
}
