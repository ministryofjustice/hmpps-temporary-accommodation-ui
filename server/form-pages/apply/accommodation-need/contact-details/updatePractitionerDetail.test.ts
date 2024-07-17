import { SessionData } from 'express-session'
import { applicationFactory } from '../../../../testutils/factories'
import UpdatePractitionerDetail, { UpdatePractitionerDetailKey, errorMessages } from './updatePractitionerDetail'
import TasklistPage from '../../../tasklistPage'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'

const testBody = {
  name: 'Jane Doe',
  email: 'jane.doe@example.org',
  phone: '0123456789',
}
const mockSessionUser = {
  displayName: 'John Smith',
  email: 'john.smith@example.org',
  telephoneNumber: '0987654321',
}

describe.each(['name', 'email', 'phone'])('updatePractitionerDetail', (propertyName: UpdatePractitionerDetailKey) => {
  class ConcreteUpdatePractitionerDetail extends UpdatePractitionerDetail implements TasklistPage {
    title = 'Update detail'

    htmlDocumentTitle = this.title

    propertyName = propertyName
  }

  const application = applicationFactory.build()
  const body = { [propertyName]: testBody[propertyName] }

  describe('body', () => {
    it('sets the body to existing value', () => {
      const page = new ConcreteUpdatePractitionerDetail(body, application)

      expect(page.body).toEqual(body)
    })

    it('sets the body to the value found in the user details if no existing value', () => {
      const page = new ConcreteUpdatePractitionerDetail({}, application, {
        userDetails: mockSessionUser,
      } as SessionData)

      page.body = {}

      let expectedValue: string
      if (propertyName === 'name') expectedValue = mockSessionUser.displayName
      if (propertyName === 'email') expectedValue = mockSessionUser.email
      if (propertyName === 'phone') expectedValue = mockSessionUser.telephoneNumber

      expect(page.body).toEqual({
        [propertyName]: expectedValue,
      })
    })
  })

  itShouldHavePreviousValue(new ConcreteUpdatePractitionerDetail({}, application), 'probation-practitioner')
  itShouldHaveNextValue(new ConcreteUpdatePractitionerDetail({}, application), 'probation-practitioner')

  describe('response', () => {
    it('returns an empty object as this response is not used directly', () => {
      const page = new ConcreteUpdatePractitionerDetail(body, application)

      expect(page.response()).toEqual({})
    })
  })
  describe('errors', () => {
    it('returns an empty object if the relevant property is populated', () => {
      const page = new ConcreteUpdatePractitionerDetail(body, application)

      expect(page.errors()).toEqual({})
    })

    it('returns an error if the relevant property is not populated', () => {
      const page = new ConcreteUpdatePractitionerDetail({}, application)

      expect(page.errors()).toEqual({
        [propertyName]: errorMessages[propertyName],
      })
    })
  })
})
