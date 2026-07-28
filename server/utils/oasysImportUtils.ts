import { TemporaryAccommodationApplication as Application, OASysQuestion, Cas3OASysGroup } from '../@types/shared'
import { DataServices, OasysPage } from '../@types/ui'
import { CallConfig } from '../data/restClient'
import oasysStubs from '../data/stubs/oasysStubs.json'
import { DateFormats } from './dateUtils'
import { mapApiPersonRisksForUi } from './utils'

export type Constructor<T> = new (body: Record<string, unknown>) => T

export const getOasysRiskManagement = async <T extends OasysPage>(
  body: Record<string, unknown>,
  application: Application,
  callConfig: CallConfig,
  dataServices: DataServices,
  constructor: Constructor<T>,
  {
    summaryKey,
    answerKey,
  }: {
    summaryKey: string
    answerKey: string
  },
): Promise<T> => {
  let oasysRiskManagement: Cas3OASysGroup
  let oasysSuccess: boolean

  try {
    oasysRiskManagement = await dataServices.personService.getOasysRiskManagement(callConfig, application.person.crn)
    oasysSuccess = oasysRiskManagement?.assessmentMetadata?.hasApplicableAssessment ?? false
  } catch (err) {
    oasysRiskManagement = oasysStubs
    oasysSuccess = false
  }

  oasysRiskManagement = filterOasysQuestions(oasysRiskManagement)

  const summaries = sortOasysImportSummaries(oasysRiskManagement.answers).map(question => {
    const answer =
      (body[answerKey] as Record<string, unknown>)?.[questionKeyFromNumber(question.questionNumber)] || question.answer
    return {
      label: question.label,
      questionNumber: question.questionNumber,
      answer,
    } as OASysQuestion
  })

  const page = new constructor(body)

  page.body[summaryKey] = summaries
  page.body.oasysImported = body.oasysImported || DateFormats.dateObjToIsoDate(new Date())
  page.body.oasysCompleted =
    body.oasysCompleted ||
    oasysRiskManagement?.assessmentMetadata?.dateCompleted ||
    oasysRiskManagement?.assessmentMetadata?.dateStarted
  page.oasysSuccess = oasysSuccess
  page.risks = mapApiPersonRisksForUi(application.risks)

  return page
}

export const validateOasysEntries = <T>(body: Partial<T>, questionKey: keyof T, answerKey: keyof T) => {
  const errors: Record<string, string> = {}
  const questions = body[questionKey] as Array<OASysQuestion>
  const answers = body[answerKey] as Record<string, unknown>

  Object.values(questions).forEach(value => {
    const question = value
    if (!answers?.[questionKeyFromNumber(question.questionNumber)]) {
      const errorAnswerKey = `${answerKey as string}[${questionKeyFromNumber(question.questionNumber)}]`

      errors[errorAnswerKey] = `You must enter a response for the '${question.label}' question`
    }
  })

  return errors
}

export const questionKeyFromNumber = (questionNumber: string) => `Q${questionNumber}`

export const questionNumberFromKey = (key: string) => key.substring(1)

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

export const sortOasysImportSummaries = (summaries: Array<OASysQuestion>): Array<OASysQuestion> => {
  return summaries.sort((a, b) => Number(a.questionNumber) - Number(b.questionNumber))
}

const filterOasysQuestions = (oasysGroup: Cas3OASysGroup): Cas3OASysGroup => {
  const permittedRiskManagementQuestions = ['RM30', 'RM31', 'RM32', 'RM33']

  return {
    assessmentMetadata: oasysGroup.assessmentMetadata,
    answers: oasysGroup.answers.filter(a => permittedRiskManagementQuestions.includes(a.questionNumber)),
  }
}
