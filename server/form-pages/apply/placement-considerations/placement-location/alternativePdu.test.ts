import { applicationFactory } from '../../../../testutils/factories'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'
import { yesOrNoResponseWithDetail } from '../../../utils'
import AlternativePdu from './alternativePdu'

jest.mock('../../../utils')

const body = { alternativePdu: 'yes' as const, alternativePduDetail: 'Detail' }

describe('AlternativePdu', () => {
  const application = applicationFactory.build()

  describe('body', () => {
    it('sets the body', () => {
      const page = new AlternativePdu(body, application)

      expect(page.body).toEqual(body)
    })
  })

  itShouldHavePreviousValue(new AlternativePdu({}, application), 'dashboard')
  itShouldHaveNextValue(new AlternativePdu({}, application), '')

  describe('errors', () => {
    it('returns an empty object if the alternative PDU fields are populated', () => {
      const page = new AlternativePdu(body, application)
      expect(page.errors()).toEqual({})
    })

    it('returns an empty object if the alternative PDU answer is no', () => {
      const page = new AlternativePdu({ alternativePdu: 'no' }, application)
      expect(page.errors()).toEqual({})
    })

    it('returns an error if the alternative PDU answer not populated', () => {
      const page = new AlternativePdu({ ...body, alternativePdu: undefined }, application)
      expect(page.errors()).toEqual({
        alternativePdu: 'You must specify if placement is required in an alternative PDU',
      })
    })

    it('returns an error if the alternative PDU answer is yes but details are not populated', () => {
      const page = new AlternativePdu({ ...body, alternativePduDetail: undefined }, application)
      expect(page.errors()).toEqual({
        alternativePduDetail: 'You must provide the alternative PDU and the reason it is preferred',
      })
    })
  })

  describe('response', () => {
    it('returns a translated version of the response', () => {
      ;(yesOrNoResponseWithDetail as jest.Mock).mockReturnValue('Response with optional detail')

      const page = new AlternativePdu(body, application)
      expect(page.response()).toEqual({
        'Is placement required in an alternative PDU?': 'Response with optional detail',
      })
      expect(yesOrNoResponseWithDetail).toHaveBeenCalledWith('alternativePdu', body)
    })
  })
})
