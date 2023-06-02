import { applicationFactory } from '../../../../testutils/factories'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'
import TasklistPage from '../../../tasklistPage'

import ContactDetails from './contactDetails'

class ConcreteContactDetails extends ContactDetails implements TasklistPage {
  title = 'A title'

  previousPageId = 'previous-page-id'

  nextPageId = 'next-page-id'
}

const body = { name: 'Some Name', phone: '01234 56789', email: 'name@example.com' }

describe('ContactDetails', () => {
  const application = applicationFactory.build()

  describe('body', () => {
    it('sets the body', () => {
      const page = new ConcreteContactDetails(body, application)

      expect(page.body).toEqual(body)
    })
  })

  itShouldHavePreviousValue(new ConcreteContactDetails({}, application), 'previous-page-id')
  itShouldHaveNextValue(new ConcreteContactDetails({}, application), 'next-page-id')

  describe('errors', () => {
    it('returns an empty object if the contact details are populated', () => {
      const page = new ConcreteContactDetails(body, application)
      expect(page.errors()).toEqual({})
    })

    it('returns an error if the name is not populated', () => {
      const page = new ConcreteContactDetails({ ...body, name: undefined }, application)
      expect(page.errors()).toEqual({ name: 'You must specify a name' })
    })

    it('returns an error if the phone number is not populated', () => {
      const page = new ConcreteContactDetails({ ...body, phone: undefined }, application)
      expect(page.errors()).toEqual({ phone: 'You must specify a phone number' })
    })

    it('returns an error if the email address is not populated', () => {
      const page = new ConcreteContactDetails({ ...body, email: undefined }, application)
      expect(page.errors()).toEqual({ email: 'You must specify an email address' })
    })
  })

  describe('response', () => {
    it('returns a translated version of the response', () => {
      const page = new ConcreteContactDetails(body, application)

      expect(page.response()).toEqual({
        'A title': [
          {
            Name: 'Some Name',
            Phone: '01234 56789',
            Email: 'name@example.com',
          },
        ],
      })
    })
  })
})
