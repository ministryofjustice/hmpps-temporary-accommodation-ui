import { SessionData } from 'express-session'
import { createMock } from '@golevelup/ts-jest'
import { applicationFactory, referenceDataFactory } from '../../../../testutils/factories'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'
import PractitionerPdu, { PractitionerPduBody } from './practitionerPdu'
import { UserDetails } from '../../../../services/userService'
import { CallConfig } from '../../../../data/restClient'
import { ReferenceDataService } from '../../../../services'
import { getProbationPractitionerName } from '../../../utils'

jest.mock('../../../utils')

describe('PractitionerPdu', () => {
  const body: PractitionerPduBody = { id: 'some-pdu-id', name: 'Some PDU' }
  const mockSessionUser: Partial<SessionData> = {
    userDetails: {
      probationDeliveryUnit: {
        id: 'session-pdu-id',
        name: 'Session PDU',
      },
    } as UserDetails,
  }
  const application = applicationFactory.build()
  const callConfig = { token: 'some-token' } as CallConfig

  beforeEach(() => {
    ;(getProbationPractitionerName as jest.Mock).mockReturnValue('Some Name')
  })

  describe('initialize', () => {
    it('returns the page with PDUs fetched from the API', async () => {
      const pdus = referenceDataFactory.pdu().buildList(10)
      const getRegionPdusMock = jest.fn().mockResolvedValue(pdus)
      const referenceDataService = createMock<ReferenceDataService>({
        getRegionPdus: getRegionPdusMock,
      })

      const page = await PractitionerPdu.initialize(
        {} as PractitionerPduBody,
        application,
        callConfig,
        {
          referenceDataService,
        },
        mockSessionUser,
      )

      expect(getRegionPdusMock).toHaveBeenCalledWith(callConfig)
      expect(page).toBeInstanceOf(PractitionerPdu)
      expect(page.pdus).toEqual(pdus)
    })
  })

  describe('body', () => {
    it('sets the body to the existing value', () => {
      const page = new PractitionerPdu(body, application)

      expect(page.body).toEqual(body)
    })

    it('sets the body to the value found in the user details if no existing value', () => {
      const page = new PractitionerPdu({}, application, mockSessionUser)

      expect(page.body).toEqual(mockSessionUser.userDetails.probationDeliveryUnit)
    })

    it('sets the body based on the value submitted and the PDUs from the API', () => {
      const pdus = [
        referenceDataFactory.pdu().build(),
        referenceDataFactory.pdu().build(),
        referenceDataFactory.pdu().build(),
      ]

      const page = new PractitionerPdu({}, application, mockSessionUser, pdus)

      page.body = { id: pdus[0].id }

      expect(page.body).toEqual({
        id: pdus[0].id,
        name: pdus[0].name,
      })
    })
  })

  itShouldHavePreviousValue(new PractitionerPdu({}, application), 'probation-practitioner')
  itShouldHaveNextValue(new PractitionerPdu({}, application), 'probation-practitioner')

  describe('errors', () => {
    it('returns no errors if the PDU is defined', () => {
      const page = new PractitionerPdu(body, application)

      expect(page.errors()).toEqual({})
    })

    it('returns an error if the PDU is not populated', () => {
      const page = new PractitionerPdu({}, application)

      expect(page.errors()).toEqual({ id: 'You must specify a PDU' })
    })
  })

  describe('response', () => {
    it('returns the selected PDU name as the response', () => {
      const page = new PractitionerPdu(body, application)

      expect(page.response()).toEqual({
        PDU: 'Some PDU',
      })
    })
  })

  describe('getRegionPdus', () => {
    it('returns the PDUs formatted for use in a select element', () => {
      const pdus = [
        referenceDataFactory.pdu().build(),
        referenceDataFactory.pdu().build(),
        referenceDataFactory.pdu().build(),
      ]

      const page = new PractitionerPdu({ id: pdus[1].id, name: pdus[1].name }, application, mockSessionUser, pdus)

      const renderedPdus = page.getRegionPdus()

      expect(renderedPdus).toEqual([
        {
          value: '',
          text: 'Select an option',
        },
        {
          value: pdus[0].id,
          text: pdus[0].name,
        },
        {
          value: pdus[1].id,
          text: pdus[1].name,
          selected: true,
        },
        {
          value: pdus[2].id,
          text: pdus[2].name,
        },
      ])
    })
  })
})
