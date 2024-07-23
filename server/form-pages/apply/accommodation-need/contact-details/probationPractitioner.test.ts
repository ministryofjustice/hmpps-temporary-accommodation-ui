import { SessionData } from 'express-session'
import { applicationFactory } from '../../../../testutils/factories'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'
import ProbationPractitioner, { ProbationPractitionerBody, errorMessages } from './probationPractitioner'
import paths from '../../../../paths/apply'
import { UserDetails } from '../../../../services/userService'

describe('ProbationPractitioner', () => {
  const application = applicationFactory.build()
  const body: ProbationPractitionerBody = {
    name: 'Jane Doe',
    email: 'jane.doe@example.org',
    phone: '0123456789',
    pdu: { id: 'pdu-id', name: 'PDU Name' },
  }

  describe('body', () => {
    it('sets the body from updated values in application', () => {
      const updatedApplication = applicationFactory.build()
      updatedApplication.data = {
        'contact-details': {
          'practitioner-name': {
            name: 'Jack Black',
          },
          'practitioner-email': {
            email: 'jack.black@example.org',
          },
          'practitioner-phone': {
            phone: '0333222111',
          },
          'practitioner-pdu': {
            id: 'updated-pdu-id',
            name: 'Updated PDU Name',
          },
        },
      }
      const page = new ProbationPractitioner(body, updatedApplication)

      expect(page.body).toEqual({
        name: 'Jack Black',
        email: 'jack.black@example.org',
        phone: '0333222111',
        pdu: {
          id: 'updated-pdu-id',
          name: 'Updated PDU Name',
        },
      })
    })

    it('sets the body from the existing value if no updated values in application', () => {
      const page = new ProbationPractitioner(body, application)

      expect(page.body).toEqual(body)
    })

    it('sets the body to the value found in the user session details if no updated or existing value', () => {
      const userDetails: Partial<UserDetails> = {
        displayName: 'John Smith',
        email: 'john.smith@example.org',
        telephoneNumber: '0987654321',
        probationDeliveryUnit: {
          id: 'user-pdu-id',
          name: 'User PDU Name',
        },
      }
      const page = new ProbationPractitioner({}, application, { userDetails } as SessionData)

      expect(page.body).toEqual({
        name: 'John Smith',
        email: 'john.smith@example.org',
        phone: '0987654321',
        pdu: {
          id: 'user-pdu-id',
          name: 'User PDU Name',
        },
      })
    })
  })

  itShouldHavePreviousValue(new ProbationPractitioner({}, application), 'dashboard')
  itShouldHaveNextValue(new ProbationPractitioner({}, application), 'backup-contact')

  describe('response', () => {
    it('should return the full data', () => {
      const page = new ProbationPractitioner(body, application)

      expect(page.response()).toEqual({
        'Probation practitioner details': [
          {
            Name: 'Jane Doe',
            Email: 'jane.doe@example.org',
            Phone: '0123456789',
            PDU: 'PDU Name',
          },
        ],
      })
    })
  })

  describe('errors', () => {
    it('returns an empty object if all properties are present', () => {
      const page = new ProbationPractitioner(body, application)

      expect(page.errors()).toEqual({})
    })

    it.each(['name', 'email', 'phone', 'pdu'])('returns an error if the %s property is missing', key => {
      const bodyIncomplete = { ...body, [key]: undefined } as Partial<ProbationPractitionerBody>
      const page = new ProbationPractitioner(bodyIncomplete, application)

      expect(page.errors()).toEqual({ [key]: errorMessages[key] })
    })
  })

  describe('summaryListItems', () => {
    describe('when there is no data', () => {
      it('returns items formatted as summary list rows with links', () => {
        const page = new ProbationPractitioner({}, application)

        expect(page.summaryListItems()).toEqual([
          {
            key: { text: 'Name' },
            value: {
              html: `<a href="${paths.applications.pages.show({
                id: application.id,
                task: 'contact-details',
                page: 'practitioner-name',
              })}" class="govuk-link">Enter a name</a>`,
            },
          },
          {
            key: { text: 'Email address' },
            value: {
              html: `<a href="${paths.applications.pages.show({
                id: application.id,
                task: 'contact-details',
                page: 'practitioner-email',
              })}" class="govuk-link">Enter an email address</a>`,
            },
          },
          {
            key: { text: 'Phone number' },
            value: {
              html: `<a href="${paths.applications.pages.show({
                id: application.id,
                task: 'contact-details',
                page: 'practitioner-phone',
              })}" class="govuk-link">Enter a phone number</a>`,
            },
          },
          {
            key: { text: 'PDU (Probation delivery unit)' },
            value: {
              html: `<a href="${paths.applications.pages.show({
                id: application.id,
                task: 'contact-details',
                page: 'practitioner-pdu',
              })}" class="govuk-link">Enter a PDU</a>`,
            },
          },
        ])
      })
    })
    describe('when there is data', () => {
      it('returns items formatted as summary list rows with value and action', () => {
        const page = new ProbationPractitioner(body, application)

        expect(page.summaryListItems()).toEqual([
          {
            key: { text: 'Name' },
            value: { text: 'Jane Doe' },
            actions: {
              items: [
                {
                  href: paths.applications.pages.show({
                    id: application.id,
                    task: 'contact-details',
                    page: 'practitioner-name',
                  }),
                  text: 'Change',
                  visuallyHiddenText: 'Name',
                },
              ],
            },
          },
          {
            key: { text: 'Email address' },
            value: { text: 'jane.doe@example.org' },
            actions: {
              items: [
                {
                  href: paths.applications.pages.show({
                    id: application.id,
                    task: 'contact-details',
                    page: 'practitioner-email',
                  }),
                  text: 'Change',
                  visuallyHiddenText: 'Email address',
                },
              ],
            },
          },
          {
            key: { text: 'Phone number' },
            value: { text: '0123456789' },
            actions: {
              items: [
                {
                  href: paths.applications.pages.show({
                    id: application.id,
                    task: 'contact-details',
                    page: 'practitioner-phone',
                  }),
                  text: 'Change',
                  visuallyHiddenText: 'Phone number',
                },
              ],
            },
          },
          {
            key: { text: 'PDU (Probation delivery unit)' },
            value: { text: 'PDU Name' },
            actions: {
              items: [
                {
                  href: paths.applications.pages.show({
                    id: application.id,
                    task: 'contact-details',
                    page: 'practitioner-pdu',
                  }),
                  text: 'Change',
                  visuallyHiddenText: 'PDU (Probation delivery unit)',
                },
              ],
            },
          },
        ])
      })
    })
  })

  describe('disableButton', () => {
    it('returns true if some of the body properties are missing', () => {
      const page = new ProbationPractitioner({ name: 'Jane' }, application)

      expect(page.disableButton()).toBe(true)
    })

    it('returns false if all the body properties are present', () => {
      const page = new ProbationPractitioner(body, application)

      expect(page.disableButton()).toBe(false)
    })
  })
})
