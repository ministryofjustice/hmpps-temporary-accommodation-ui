import { applicationFactory, personFactory } from '../../../../testutils/factories'
import { getOasysSections, oasysImportReponse, validateOasysEntries } from '../../../../utils/oasysImportUtils'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'
import RiskManagementPlan from './riskManagementPlan'

jest.mock('../../../../utils/oasysImportUtils')

const body = {
  oasysImported: '2023-08-02',
  oasysCompleted: '2023-08-02',
  riskManagementAnswers: {
    Q1: 'Some answer for the first risk management question. With an extra comment 1',
    Q2: 'Some answer for the second risk management question. With an extra comment 2',
    Q3: 'Some answer for the third risk management question. With an extra comment 3',
  },
  riskManagementSummaries: [
    {
      questionNumber: '1',
      label: 'The first risk management question',
      answer: 'Some answer for the first risk management question. With an extra comment 1',
    },
    {
      questionNumber: '2',
      label: 'The second risk management question',
      answer: 'Some answer for the second risk management question. With an extra comment 2',
    },
    {
      questionNumber: '3',
      label: 'The third risk management question',
      answer: 'Some answer for the third risk management question. With an extra comment 3',
    },
  ],
}
const dataServices = {}
const callConfig = { token: 'some-token' }

describe('RiskManagementPlan', () => {
  const application = applicationFactory.build({
    person: personFactory.build({
      name: 'John Smith',
    }),
  })

  describe('initialize', () => {
    it('returns the result of getOasysSections', async () => {
      const page = new RiskManagementPlan(body)
      ;(getOasysSections as jest.MockedFunction<typeof getOasysSections>).mockResolvedValue(page)

      const result = await RiskManagementPlan.initialize(body, application, callConfig, dataServices)

      expect(result).toEqual(page)
      expect(getOasysSections).toHaveBeenCalledWith(body, application, callConfig, dataServices, RiskManagementPlan, {
        sectionName: 'riskManagementPlan',
        summaryKey: 'riskManagementSummaries',
        answerKey: 'riskManagementAnswers',
      })
    })
  })

  itShouldHavePreviousValue(new RiskManagementPlan({}), 'rosh-level')
  itShouldHaveNextValue(new RiskManagementPlan({}), '')

  describe('errors', () => {
    it('returns the result of validateOasysEntries', () => {
      const page = new RiskManagementPlan(body)

      ;(validateOasysEntries as jest.MockedFunction<typeof validateOasysEntries>).mockReturnValue({
        someField: 'An error message',
      })

      expect(page.errors()).toEqual({
        someField: 'An error message',
      })
    })
  })

  describe('response', () => {
    it('returns the result of oasysImportReponse', () => {
      const page = new RiskManagementPlan(body)

      ;(oasysImportReponse as jest.MockedFunction<typeof oasysImportReponse>).mockReturnValue({
        'A question': 'An answer',
      })

      expect(page.response()).toEqual({ 'A question': 'An answer' })
      expect(oasysImportReponse).toHaveBeenCalledWith(body.riskManagementAnswers, body.riskManagementSummaries)
    })
  })
})
