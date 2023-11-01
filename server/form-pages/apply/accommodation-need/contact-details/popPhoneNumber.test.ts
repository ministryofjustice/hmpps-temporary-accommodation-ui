import { applicationFactory } from '../../../../testutils/factories'
import { personName } from '../../../../utils/personUtils'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'
import PopPhoneNumber from './popPhoneNumber'

jest.mock('../../../../utils/personUtils')

const body = { phone: '12345' }

describe('PopPhoneNumber', () => {
  const application = applicationFactory.build()

  describe('body', () => {
    it('sets the body', () => {
      const page = new PopPhoneNumber(body, application)

      expect(page.body).toEqual(body)
    })
  })

  describe('title', () => {
    it('sets the title', () => {
      ;(personName as jest.Mock).mockReturnValue('Some Name')

      const page = new PopPhoneNumber(body, application)

      expect(page.title).toEqual("What is Some Name's phone number?")
    })
  })

  describe('response', () => {
    it('returns a translated version of the response', () => {
      const page = new PopPhoneNumber(body, application)

      expect(page.response()).toEqual({
        "What is the person's phone number?": '12345',
      })
    })
  })

  describe('errors', () => {
    it('returns an empty object', () => {
      const page = new PopPhoneNumber(body, application)

      expect(page.errors()).toEqual({})
    })
  })

  itShouldHavePreviousValue(new PopPhoneNumber(body, application), 'practitioner-pdu')
  itShouldHaveNextValue(new PopPhoneNumber(body, application), '')
})
