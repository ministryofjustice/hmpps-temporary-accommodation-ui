import { SessionData } from 'express-session'
import { applicationFactory } from '../../../../testutils/factories'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'
import ProbationPractitioner, { ProbationPractitionerBody } from './probationPractitioner'
import { errorMessages } from './updatePractitionerDetail'
import paths from '../../../../paths/apply'

describe('ProbationPractitioner', () => {
  const application = applicationFactory.build()
  const body = { name: 'Jane Doe', email: 'jane.doe@example.org', phone: '0123456789' } as ProbationPractitionerBody

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
        },
      }
      const page = new ProbationPractitioner(body, updatedApplication)

      expect(page.body).toEqual({
        name: 'Jack Black',
        email: 'jack.black@example.org',
        phone: '0333222111',
      })
    })

    it('sets the body from the existing value if no updated values in application', () => {
      const page = new ProbationPractitioner(body, application)

      expect(page.body).toEqual(body)
    })

    it('sets the body to the value found in the user session details if no updated or existing value', () => {
      const userDetails = {
        displayName: 'John Smith',
        email: 'john.smith@example.org',
        telephoneNumber: '0987654321',
      }
      const page = new ProbationPractitioner({}, application, { userDetails } as SessionData)

      expect(page.body).toEqual({
        name: 'John Smith',
        email: 'john.smith@example.org',
        phone: '0987654321',
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

    it.each(['name', 'email', 'phone'])('returns an error if the %s property is missing', key => {
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
                  visuallyHiddenText: 'name',
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
                  visuallyHiddenText: 'email address',
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
                  visuallyHiddenText: 'phone number',
                },
              ],
            },
          },
        ])
      })
    })
  })
})
