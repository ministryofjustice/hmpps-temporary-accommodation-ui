import { SessionData } from 'express-session'
import { applicationFactory } from '../../../../testutils/factories'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'
import ProbationPractitioner, { ProbationPractitionerBody, errorMessages } from './probationPractitioner'
import paths from '../../../../paths/apply'

describe('ProbationPractitioner', () => {
  const body: ProbationPractitionerBody = {
    name: 'Jane Doe',
    email: 'jane.doe@example.org',
    phone: '0123456789',
    pdu: { id: 'pdu-id', name: 'PDU Name' },
  }

  const application = applicationFactory.build({
    data: {
      'contact-details': {
        'probation-practitioner': body,
      },
    },
  })

  const session = {
    userDetails: {
      displayName: 'John Smith',
      email: 'john.smith@example.org',
      telephoneNumber: '0987654321',
      probationDeliveryUnit: {
        id: 'user-pdu-id',
        name: 'User PDU Name',
      },
    },
  } as SessionData

  describe('body', () => {
    it('sets the body from updated values in application', () => {
      const updatedApplication = applicationFactory.build()
      updatedApplication.data = {
        'contact-details': {
          'probation-practitioner': body,
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

      const page = new ProbationPractitioner({}, updatedApplication, session)

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
      const page = new ProbationPractitioner({}, application, session)

      expect(page.body).toEqual(body)
    })

    it('sets the body to the value found in the user session details if no updated or existing value', () => {
      const applicationNoData = applicationFactory.build()

      const page = new ProbationPractitioner({}, applicationNoData, session)

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

    describe('backwards compatibility', () => {
      it('sets the PDU id and name values to undefined if the PDU had been entered in a free text field', () => {
        const oldApplication = applicationFactory.build()
        oldApplication.data = {
          'contact-details': {
            'probation-practitioner': {
              name: 'Jane Doe',
              email: 'jane.doe@example.org',
              phone: '0123456789',
            },
            'practitioner-pdu': {
              pdu: 'Some PDU',
            },
          },
        }

        const page = new ProbationPractitioner({}, oldApplication, session)

        expect(page.body).toEqual({
          name: 'Jane Doe',
          email: 'jane.doe@example.org',
          phone: '0123456789',
          pdu: {
            id: undefined,
            name: undefined,
          },
        })
      })
    })
  })

  itShouldHavePreviousValue(new ProbationPractitioner({}, application), 'dashboard')
  itShouldHaveNextValue(new ProbationPractitioner({}, application), 'backup-contact')

  describe('response', () => {
    it('should return the full data', () => {
      const page = new ProbationPractitioner({}, application)

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
    it('returns an empty object if all properties are saved in the application', () => {
      const page = new ProbationPractitioner({}, application)

      expect(page.errors()).toEqual({})
    })

    it.each(['name', 'email', 'phone', 'pdu'] as const)(
      'returns an error if the %s property is missing in the application',
      key => {
        const bodyIncomplete = { ...body, [key]: undefined } as Partial<ProbationPractitionerBody>
        const applicationIncomplete = applicationFactory.build()
        applicationIncomplete.data = {
          'contact-details': {
            'probation-practitioner': bodyIncomplete,
          },
        }

        const page = new ProbationPractitioner({}, applicationIncomplete)

        expect(page.errors()).toEqual({ [key]: errorMessages[key] })
      },
    )

    it.each([{}, { id: 'pdu-id' }, { name: 'PDU name' }, { pdu: 'Some PDU' }])(
      'returns a PDU error if the PDU data is missing id or name',
      pduData => {
        const bodyInvalidPDU = { ...body, pdu: pduData } as Partial<ProbationPractitionerBody>
        const applicationInvalidPDU = applicationFactory.build()
        applicationInvalidPDU.data = {
          'contact-details': {
            'probation-practitioner': bodyInvalidPDU,
          },
        }

        const page = new ProbationPractitioner({}, applicationInvalidPDU)

        expect(page.errors()).toEqual({ pdu: errorMessages.pdu })
      },
    )
  })

  describe('summaryListItems', () => {
    describe('when there is no data', () => {
      it('returns items formatted as summary list rows with links', () => {
        const applicationNoData = applicationFactory.build()
        const page = new ProbationPractitioner({}, applicationNoData)

        expect(page.summaryListItems()).toEqual([
          {
            key: { text: 'Name' },
            value: {
              html: `<a href="${paths.applications.pages.show({
                id: applicationNoData.id,
                task: 'contact-details',
                page: 'practitioner-name',
              })}" class="govuk-link">Enter a name</a>`,
            },
          },
          {
            key: { text: 'Email address' },
            value: {
              html: `<a href="${paths.applications.pages.show({
                id: applicationNoData.id,
                task: 'contact-details',
                page: 'practitioner-email',
              })}" class="govuk-link">Enter an email address</a>`,
            },
          },
          {
            key: { text: 'Phone number' },
            value: {
              html: `<a href="${paths.applications.pages.show({
                id: applicationNoData.id,
                task: 'contact-details',
                page: 'practitioner-phone',
              })}" class="govuk-link">Enter a phone number</a>`,
            },
          },
          {
            key: { text: 'PDU (Probation Delivery Unit)' },
            value: {
              html: `<a href="${paths.applications.pages.show({
                id: applicationNoData.id,
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
        const page = new ProbationPractitioner({}, application)

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
            key: { text: 'PDU (Probation Delivery Unit)' },
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
                  visuallyHiddenText: 'PDU (Probation Delivery Unit)',
                },
              ],
            },
          },
        ])
      })
    })
  })

  describe('disableButton', () => {
    it('returns true if some of the data is missing', () => {
      const applicationNoData = applicationFactory.build()
      const page = new ProbationPractitioner({}, applicationNoData)

      expect(page.disableButton()).toBe(true)
    })

    it('returns false if all the data is present', () => {
      const page = new ProbationPractitioner({}, application)

      expect(page.disableButton()).toBe(false)
    })
  })
})
