import { applicationFactory } from '../../../../testutils/factories'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'
import { getProbationPractitionerName } from '../../../utils'
import PractitionerPdu from './practitionerPdu'

jest.mock('../../../utils')

const body = { pdu: 'Some PDU' }

describe('PractitionerPdu', () => {
  const application = applicationFactory.build()

  describe('body', () => {
    it('sets the body', () => {
      const page = new PractitionerPdu(body, application)

      expect(page.body).toEqual(body)
    })
  })

  describe('title', () => {
    it('sets the body', () => {
      ;(getProbationPractitionerName as jest.Mock).mockReturnValue('Some Name')
      const page = new PractitionerPdu(body, application)

      expect(getProbationPractitionerName).toHaveBeenCalledWith(application)
      expect(page.title).toEqual("What is Some Name's PDU?")
    })
  })

  itShouldHavePreviousValue(new PractitionerPdu({}, application), 'backup-contact')
  itShouldHaveNextValue(new PractitionerPdu({}, application), 'pop-phone-number')

  describe('errors', () => {
    it('returns an empty object if the PDU is defined', () => {
      const page = new PractitionerPdu(body, application)
      expect(page.errors()).toEqual({})
    })

    it('returns an error if the PDU is not populated', () => {
      const page = new PractitionerPdu({ ...body, pdu: undefined }, application)
      expect(page.errors()).toEqual({ pdu: 'You must specify a PDU' })
    })
  })

  describe('response', () => {
    it('returns a translated version of the response', () => {
      const page = new PractitionerPdu(body, application)

      expect(page.response()).toEqual({
        PDU: 'Some PDU',
      })
    })
  })
})
