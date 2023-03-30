import { DeepMocked, createMock } from '@golevelup/ts-jest'
import { CallConfig } from '../../../../data/restClient'
import { PersonService } from '../../../../services'
import { applicationFactory, oasysSectionsFactory, risksFactory } from '../../../../testutils/factories'
import { oasysImportReponse } from '../../../../utils/oasysImportUtils'
import { mapApiPersonRisksForUi } from '../../../../utils/utils'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'

import OffenceDetails from './offenceDetails'

jest.mock('../../../../services/personService.ts')

describe('OffenceDetails', () => {
  const callConfig = { token: 'some-call-config-token' } as CallConfig

  const oasysSections = oasysSectionsFactory.build()
  const personRisks = risksFactory.build()
  const application = applicationFactory.build({ risks: personRisks })

  describe('initialize', () => {
    const getOasysSectionsMock = jest.fn()

    let personService: DeepMocked<PersonService>

    beforeEach(() => {
      personService = createMock<PersonService>({
        getOasysSections: getOasysSectionsMock,
      })
      getOasysSectionsMock.mockResolvedValue(oasysSections)
    })

    afterEach(() => {
      jest.resetAllMocks()
    })

    it('calls the getOasysSections  method on the client with a token and the persons CRN', async () => {
      await OffenceDetails.initialize({}, application, callConfig, { personService })

      expect(getOasysSectionsMock).toHaveBeenCalledWith(callConfig, application.person.crn)
    })

    it('adds the offenceDetailsSummaries and personRisks to the page object', async () => {
      const page = await OffenceDetails.initialize({}, application, callConfig, { personService })

      expect(page.offenceDetailsSummaries).toEqual(oasysSections.offenceDetails)
      expect(page.risks).toEqual(mapApiPersonRisksForUi(personRisks))
      expect(page.oasysCompleted).toEqual(oasysSections.dateCompleted)
    })

    it('sets dateCompleted to dateStarted if dateCompleted is null', async () => {
      getOasysSectionsMock.mockResolvedValue({ ...oasysSections, dateCompleted: null })

      const page = await OffenceDetails.initialize({}, application, callConfig, { personService })
      expect(page.oasysCompleted).toEqual(oasysSections.dateStarted)
    })

    itShouldHaveNextValue(new OffenceDetails({}), 'supporting-information')

    itShouldHavePreviousValue(new OffenceDetails({}), 'rosh-summary')

    describe('errors', () => {
      it('should return an empty object', () => {
        const page = new OffenceDetails({})
        expect(page.errors()).toEqual({})
      })
    })

    describe('response', () => {
      it('calls oasysImportReponse with the correct arguments', () => {
        const answers = ['answer 1']
        const summaries = [
          {
            questionNumber: '1',
            label: 'The first question',
            answer: 'Some answer for the first question',
          },
        ]
        const page = new OffenceDetails({ offenceDetailsAnswers: answers, offenceDetailsSummaries: summaries })
        const result = page.response()

        expect(result).toEqual(oasysImportReponse(answers, summaries))
      })
    })
  })
})
