import { DeepMocked, createMock } from '@golevelup/ts-jest'
import { applicationFactory, oasysSectionsFactory, risksFactory, roshSummaryFactory } from '../testutils/factories'
import { OasysPage } from '../@types/ui'
import { CallConfig } from '../data/restClient'
import oasysStubs from '../data/stubs/oasysStubs.json'
import { PersonService } from '../services'
import { OasysNotFoundError } from '../services/personService'
import { offenceDetailsFactory } from '../testutils/factories/oasysSections'
import {
  Constructor,
  getOasysSections,
  oasysImportReponse,
  questionKeyFromNumber,
  questionNumberFromKey,
  sortOasysImportSummaries,
  textareas,
  validateOasysEntries,
} from './oasysImportUtils'
import { mapApiPersonRisksForUi } from './utils'

describe('OASysImportUtils', () => {
  describe('getOasysSections', () => {
    let getOasysSectionsMock: jest.Mock
    let personService: DeepMocked<PersonService>
    let constructor: DeepMocked<Constructor<OasysPage>>

    const callConfig = { token: 'some-token' } as CallConfig

    afterEach(() => {
      jest.resetAllMocks()
    })

    beforeEach(() => {
      constructor = createMock<Constructor<OasysPage>>(
        jest.fn().mockImplementation(() => ({ body: {} }) as unknown as OasysPage),
      )
      getOasysSectionsMock = jest.fn()
      personService = createMock<PersonService>({
        getOasysSections: getOasysSectionsMock,
      })
    })

    it('sets oasysSuccess to false along with the stubs if there is an OasysNotFoundError', async () => {
      const personRisks = risksFactory.build()
      const application = applicationFactory.build({ risks: personRisks })

      getOasysSectionsMock.mockImplementation(() => {
        throw new OasysNotFoundError()
      })

      const result = await getOasysSections({}, application, callConfig, { personService }, constructor, {
        sectionName: 'offenceDetails',
        summaryKey: 'offenceDetailsSummary',
        answerKey: 'offenceDetailsAnswers',
      })

      expect(result.oasysSuccess).toEqual(false)
      expect(result.body.offenceDetailsSummary).toEqual(sortOasysImportSummaries(oasysStubs.offenceDetails))
      expect(result.risks).toEqual(mapApiPersonRisksForUi(application.risks))
    })

    it('sets oasysSuccess to true along with the marshalled oasys data if there is not an OasysNotFoundError', async () => {
      jest.useFakeTimers().setSystemTime(new Date('2024-05-01'))

      const personRisks = risksFactory.build()
      const application = applicationFactory.build({ risks: personRisks })

      const oasysSections = oasysSectionsFactory.build()

      getOasysSectionsMock.mockResolvedValue(oasysSections)

      const result = await getOasysSections({}, application, callConfig, { personService }, constructor, {
        sectionName: 'offenceDetails',
        summaryKey: 'offenceDetailsSummary',
        answerKey: 'offenceDetailsAnswers',
      })

      expect(result.oasysSuccess).toEqual(true)
      expect(result.body.offenceDetailsSummary).toEqual(sortOasysImportSummaries(oasysSections.offenceDetails))
      expect(result.body.oasysCompleted).toEqual(oasysSections.dateCompleted)
      expect(result.body.oasysImported).toEqual('2024-05-01')
      expect(result.risks).toEqual(mapApiPersonRisksForUi(application.risks))

      jest.useRealTimers()
    })

    it('prioritises the body over the Oasys data if the body is provided', async () => {
      const personRisks = risksFactory.build()
      const application = applicationFactory.build({ risks: personRisks })

      const offenceDetails = [
        offenceDetailsFactory.build({ questionNumber: '1' }),
        offenceDetailsFactory.build({ questionNumber: '2' }),
      ]

      const oasysSections = oasysSectionsFactory.build({
        offenceDetails,
        dateCompleted: '2023-01-01',
      })

      getOasysSectionsMock.mockResolvedValue(oasysSections)

      const result = await getOasysSections(
        {
          offenceDetailsAnswers: { [questionKeyFromNumber('1')]: 'My Response' },
          oasysImported: '2022-01-01',
          oasysCompleted: '2022-02-01',
        },
        application,
        callConfig,
        { personService },
        constructor,
        {
          sectionName: 'offenceDetails',
          summaryKey: 'offenceDetailsSummary',
          answerKey: 'offenceDetailsAnswers',
        },
      )

      expect(result.body.offenceDetailsSummary).toEqual([
        { answer: 'My Response', label: offenceDetails[0].label, questionNumber: offenceDetails[0].questionNumber },
        {
          answer: offenceDetails[1].answer,
          label: offenceDetails[1].label,
          questionNumber: offenceDetails[1].questionNumber,
        },
      ])
      expect(result.body.oasysImported).toEqual('2022-01-01')
      expect(result.body.oasysCompleted).toEqual('2022-02-01')
    })

    it('filters risk manangement plan questions to an accepted whitelist', async () => {
      const personRisks = risksFactory.build()
      const application = applicationFactory.build({ risks: personRisks })

      getOasysSectionsMock.mockImplementation(() => {
        throw new OasysNotFoundError()
      })

      const result = await getOasysSections({}, application, callConfig, { personService }, constructor, {
        sectionName: 'riskManagementPlan',
        summaryKey: 'riskManagementPlanSummary',
        answerKey: 'riskManagementPlanAnswers',
      })

      const questions = [
        {
          label: 'Victim safety planning',
          questionNumber: 'RM33',
          answer: '',
        },
        {
          label: 'Interventions and treatment',
          questionNumber: 'RM32',
          answer: '',
        },
        {
          label: 'Monitoring and control',
          questionNumber: 'RM31',
          answer: '',
        },
        {
          label: 'Supervision',
          questionNumber: 'RM30',
          answer: '',
        },
      ]

      expect(result.oasysSuccess).toEqual(false)
      expect(result.body.riskManagementPlanSummary).toEqual(sortOasysImportSummaries(questions))
      expect(result.risks).toEqual(mapApiPersonRisksForUi(application.risks))
    })
  })

  describe('validateOasysEntries', () => {
    const summaries = [
      {
        questionNumber: '1',
        label: 'The first question',
        answer: 'Some answer for the first question',
      },
      {
        questionNumber: '2',
        label: 'The second question',
        answer: 'Some answer for the second question',
      },
    ]

    it('should return errors for missing fields', () => {
      const answers = { [questionKeyFromNumber('1')]: '', [questionKeyFromNumber('2')]: 'Some response' }
      const body = {
        summaries,
        answers,
      }

      const errors = validateOasysEntries(body, 'summaries', 'answers')

      expect(errors).toEqual({
        [`answers[${questionKeyFromNumber('1')}]`]: "You must enter a response for the 'The first question' question",
      })
    })

    it('should return no errors when all fields are complete', () => {
      const answers = { [questionKeyFromNumber('1')]: 'Some response', [questionKeyFromNumber('2')]: 'Some response' }
      const body = {
        summaries,
        answers,
      }

      const errors = validateOasysEntries(body, 'summaries', 'answers')

      expect(errors).toEqual({})
    })
  })

  describe('questionKeyFromNumber', () => {
    it('ensures a string cannot be parsed as a number', () => {
      expect(questionKeyFromNumber('1')).toEqual('Q1')
      expect(questionKeyFromNumber('ABC')).toEqual('QABC')
    })
  })

  describe('questionNumberFromKey', () => {
    it('reverses questionKeyFromNumber', () => {
      expect(questionNumberFromKey(questionKeyFromNumber('1'))).toEqual('1')
      expect(questionNumberFromKey(questionKeyFromNumber('ABC'))).toEqual('ABC')
    })
  })

  describe('textareas', () => {
    it('it returns reoffending needs as textareas', () => {
      const roshSummaries = roshSummaryFactory.buildList(2)
      const sectionName = 'roshAnswers'
      const result = textareas(roshSummaries, sectionName)

      expect(result).toMatchStringIgnoringWhitespace(`
              <div class="govuk-form-group">
              <h3 class="govuk-label-wrapper">
                  <label class="govuk-label govuk-label--m" for=${sectionName}[${questionKeyFromNumber(
                    roshSummaries[0].questionNumber,
                  )}]>
                      ${roshSummaries[0].label}
                  </label>
              </h3>
              <textarea class="govuk-textarea" id=${sectionName}[${questionKeyFromNumber(
                roshSummaries[0].questionNumber,
              )}] name=${sectionName}[${questionKeyFromNumber(roshSummaries[0].questionNumber)}] rows="8">${
                roshSummaries[0].answer
              }</textarea>
          </div>
          <hr>
          <div class="govuk-form-group">
          <h3 class="govuk-label-wrapper">
              <label class="govuk-label govuk-label--m" for=${sectionName}[${questionKeyFromNumber(
                roshSummaries[1].questionNumber,
              )}]>
                  ${roshSummaries[1].label}
              </label>
          </h3>
          <textarea class="govuk-textarea" id=${sectionName}[${questionKeyFromNumber(
            roshSummaries[1].questionNumber,
          )}] name=${sectionName}[${questionKeyFromNumber(roshSummaries[1].questionNumber)}] rows="8">${
            roshSummaries[1].answer
          }</textarea>
      </div>
      <hr>`)
    })
  })

  describe('oasysImportReponse', () => {
    it('returns a human readable response for each question', () => {
      const answers = {
        [questionKeyFromNumber('1')]: 'answer 1',
        [questionKeyFromNumber('2')]: 'answer 2',
        [questionKeyFromNumber('3')]: 'answer 3',
      }
      const summaries = [
        {
          questionNumber: '1',
          label: 'The first question',
          answer: 'Some answer for the first question',
        },
        {
          questionNumber: '2',
          label: 'The second question',
          answer: 'Some answer for the second question',
        },
        {
          questionNumber: '3',
          label: 'The third question',
          answer: 'Some answer for the third question',
        },
      ]
      const result = oasysImportReponse(answers, summaries)

      expect(result).toEqual({
        [`1: The first question`]: `answer 1`,
        [`2: The second question`]: `answer 2`,
        [`3: The third question`]: `answer 3`,
      })
    })

    it('returns no response when there arent any questions', () => {
      const result = oasysImportReponse({}, [])

      expect(result).toEqual({})
    })
  })

  describe('sortOasysImportSummaries', () => {
    it('sorts the imports into order of questions', () => {
      const oasysSummary1 = roshSummaryFactory.build({ questionNumber: '1' })
      const oasysSummary2 = roshSummaryFactory.build({ questionNumber: '2' })
      const oasysSummary3 = roshSummaryFactory.build({ questionNumber: '3' })

      const result = sortOasysImportSummaries([oasysSummary3, oasysSummary2, oasysSummary1])
      expect(result).toEqual([oasysSummary1, oasysSummary2, oasysSummary3])
    })
  })
})
