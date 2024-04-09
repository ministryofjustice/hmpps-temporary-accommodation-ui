import { applicationFactory } from '../../../../testutils/factories'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'
import RegisteredSexOffender from './registeredSexOffender'

const body = { registeredSexOffender: 'yes' as const }

describe('RegisteredSexOffender', () => {
  const application = applicationFactory.build()

  describe('body', () => {
    it('sets the body', () => {
      const page = new RegisteredSexOffender(body, application)

      expect(page.body).toEqual(body)
    })
  })

  itShouldHavePreviousValue(new RegisteredSexOffender({}, application), 'history-of-sexual-offence')
  itShouldHaveNextValue(new RegisteredSexOffender({}, application), '')

  describe('errors', () => {
    it('returns an empty object if all fields are populated', () => {
      const page = new RegisteredSexOffender(body, application)
      expect(page.errors()).toEqual({})
    })

    it('returns an error if the registered sex offender field is not populated', () => {
      const page = new RegisteredSexOffender({ ...body, registeredSexOffender: undefined }, application)
      expect(page.errors()).toEqual({
        registeredSexOffender: 'Select yes if the person is a Registered Sex Offender (RSO)',
      })
    })
  })

  describe('response', () => {
    it('returns a translated version of the response', () => {
      const page = new RegisteredSexOffender(body, application)
      expect(page.response()).toEqual({
        'Is the person a Registered Sex Offender (RSO)?': 'Yes',
      })
    })
  })
})
