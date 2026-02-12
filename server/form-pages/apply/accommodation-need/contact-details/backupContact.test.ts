import { applicationFactory } from '../../../../testutils/factories'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'
import BackupContact from './backupContact'

const body = { name: 'Some Name', phone: '01234 56789', email: 'name@justice.gov.uk' }

describe('BackupContact', () => {
  const application = applicationFactory.build()

  describe('body', () => {
    it('sets the body', () => {
      const page = new BackupContact(body, application)

      expect(page.body).toEqual(body)
    })
  })

  itShouldHavePreviousValue(new BackupContact({}, application), 'probation-practitioner')
  itShouldHaveNextValue(new BackupContact({}, application), 'pop-phone-number')

  describe('errors', () => {
    it('returns an empty object if the contact details are populated', () => {
      const page = new BackupContact(body, application)
      expect(page.errors()).toEqual({})
    })

    it('returns an error if the name is not populated', () => {
      const page = new BackupContact({ ...body, name: undefined }, application)
      expect(page.errors()).toEqual({ name: 'You must specify a name' })
    })

    it('returns an error if the phone number is not populated', () => {
      const page = new BackupContact({ ...body, phone: undefined }, application)
      expect(page.errors()).toEqual({ phone: 'You must specify a phone number' })
    })

    it('returns an error if the email address is not populated', () => {
      const page = new BackupContact({ ...body, email: undefined }, application)
      expect(page.errors()).toEqual({ email: 'You must specify an email address' })
    })

    it('returns an error if the email address is not valid', () => {
      const page = new BackupContact({ ...body, email: 'invalid-email' }, application)
      expect(page.errors()).toEqual({ email: 'Enter an email address ending .gov.uk' })
    })

    it('returns an error if the email address is not a .gov.uk email address', () => {
      const page = new BackupContact({ ...body, email: 'name@example.com' }, application)
      expect(page.errors()).toEqual({ email: 'Enter an email address ending .gov.uk' })
    })
  })

  describe('response', () => {
    it('returns a translated version of the response', () => {
      const page = new BackupContact(body, application)

      expect(page.response()).toEqual({
        'Backup contact / senior probation officer details': [
          {
            Name: 'Some Name',
            Phone: '01234 56789',
            Email: 'name@justice.gov.uk',
          },
        ],
      })
    })
  })
})
