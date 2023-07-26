import { PersonRisksUI } from '../../../../@types/ui'
import { applicationFactory, personFactory } from '../../../../testutils/factories'
import { mapApiPersonRisksForUi } from '../../../../utils/utils'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'
import { yesOrNoResponseWithDetail } from '../../../utils'
import AntiSocialBehaviour from './antiSocialBehaviour'

jest.mock('../../../../utils/utils')
jest.mock('../../../utils')

const body = { concerns: 'yes' as const, concernsDetail: 'Detail' }
const personRisksUi = { flags: { value: ['Some flag'] } } as PersonRisksUI

describe('AntiSocialBehaviour', () => {
  const application = applicationFactory.build({
    person: personFactory.build({
      name: 'John Smith',
    }),
  })

  describe('constructor', () => {
    it('sets the body and risk information', () => {
      ;(mapApiPersonRisksForUi as jest.MockedFunction<typeof mapApiPersonRisksForUi>).mockReturnValue(personRisksUi)

      const page = new AntiSocialBehaviour(body, application)

      expect(page.body).toEqual(body)
      expect(page.risks).toEqual(personRisksUi)

      expect(mapApiPersonRisksForUi).toHaveBeenCalledWith(application.risks)
    })
  })

  itShouldHavePreviousValue(new AntiSocialBehaviour({}, application), 'cooperation')
  itShouldHaveNextValue(new AntiSocialBehaviour({}, application), 'substance-misuse')

  describe('errors', () => {
    it('returns an empty object if the concerns fields are populated', () => {
      const page = new AntiSocialBehaviour(body, application)
      expect(page.errors()).toEqual({})
    })

    it('returns an empty object if the concerns answer is no', () => {
      const page = new AntiSocialBehaviour({ concerns: 'no' }, application)
      expect(page.errors()).toEqual({})
    })

    it('returns an error if the concerns answer is not populated', () => {
      const page = new AntiSocialBehaviour({ ...body, concerns: undefined }, application)
      expect(page.errors()).toEqual({
        concerns: 'You must specify if there any concerns or risks relating to anti-social behaviour',
      })
    })

    it('returns an error if the concerns answer is yes but details are not populated', () => {
      const page = new AntiSocialBehaviour({ ...body, concernsDetail: undefined }, application)
      expect(page.errors()).toEqual({
        concernsDetail: 'You must provide details of any concerns or risks relating to anti-social behaviour',
      })
    })
  })

  describe('response', () => {
    it('returns a translated version of the response', () => {
      ;(yesOrNoResponseWithDetail as jest.Mock).mockReturnValue('Response with optional detail')

      const page = new AntiSocialBehaviour(body, application)
      expect(page.response()).toEqual({
        'Are there any concerns or risks relating to anti-social behaviour?': 'Response with optional detail',
      })
      expect(yesOrNoResponseWithDetail).toHaveBeenCalledWith('concerns', body)
    })
  })
})
