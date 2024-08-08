import { createMock } from '@golevelup/ts-jest'
import { applicationFactory, referenceDataFactory } from '../../../../testutils/factories'
import { itShouldHavePreviousValue } from '../../../shared-examples'
import AlternativePdu, { AlternativePduBody } from './alternativePdu'
import { ReferenceDataService } from '../../../../services'
import { CallConfig } from '../../../../data/restClient'

const body: AlternativePduBody = { alternativePdu: 'yes', pdu: { id: 'some-pdu-id', name: 'Some PDU' } }

describe('AlternativePdu', () => {
  const application = applicationFactory.build()
  const callConfig = { token: 'some-token' } as CallConfig

  describe('initialize', () => {
    it('returns the page with all PDUs fetched from the API', async () => {
      const pdus = referenceDataFactory.pdu().buildList(10)
      const getPdusMock = jest.fn().mockResolvedValue(pdus)
      const referenceDataService = createMock<ReferenceDataService>({
        getPdus: getPdusMock,
      })

      const page = await AlternativePdu.initialize({} as AlternativePduBody, application, callConfig, {
        referenceDataService,
      })

      expect(getPdusMock).toHaveBeenCalledWith(callConfig)
      expect(page).toBeInstanceOf(AlternativePdu)
      expect(page.pdus).toEqual(pdus)
    })
  })

  describe('body', () => {
    it('sets the body', () => {
      const page = new AlternativePdu(body, application)

      expect(page.body).toEqual(body)
    })
  })

  itShouldHavePreviousValue(new AlternativePdu({}, application), 'dashboard')

  describe('next', () => {
    it('returns the alternative PDU reason page ID if the answer is yes', () => {
      const page = new AlternativePdu(body, application)

      expect(page.next()).toEqual('alternative-pdu-reason')
    })

    it('returns a blank string for the task list if the answer is no', () => {
      const page = new AlternativePdu({ alternativePdu: 'no' }, application)

      expect(page.next()).toEqual('')
    })
  })

  describe('errors', () => {
    it('returns an empty object if the alternative PDU fields are populated', () => {
      const page = new AlternativePdu(body, application)

      expect(page.errors()).toEqual({})
    })

    it('returns an empty object if the alternative PDU answer is no', () => {
      const page = new AlternativePdu({ alternativePdu: 'no' }, application)

      expect(page.errors()).toEqual({})
    })

    it('returns an error if the alternative PDU answer is not populated', () => {
      const page = new AlternativePdu({}, application)

      expect(page.errors()).toEqual({
        alternativePdu: 'You must specify if placement is required in an alternative PDU',
      })
    })

    it('returns an error if the alternative PDU answer is yes but PDU is not selected', () => {
      const page = new AlternativePdu({ ...body, pdu: undefined }, application)

      expect(page.errors()).toEqual({
        pdu: 'You must select a PDU',
      })
    })
  })

  describe('response', () => {
    it('returns a translated version of the response when answered yes', () => {
      const page = new AlternativePdu(body, application)

      expect(page.response()).toEqual({
        'Is placement required in an alternative PDU?': 'Yes',
        'PDU for placement': 'Some PDU',
      })
    })

    it('returns a translated version of the response when answered no', () => {
      const page = new AlternativePdu({ alternativePdu: 'no' }, application)

      expect(page.response()).toEqual({
        'Is placement required in an alternative PDU?': 'No',
      })
    })
  })

  describe('getAllPdus', () => {
    it('returns the PDUs formatted for use in a select element', () => {
      const pdus = referenceDataFactory.pdu().buildList(3)

      const page = new AlternativePdu({ pdu: { id: pdus[1].id, name: pdus[1].name } }, application, pdus)

      const renderedPdus = page.getAllPdus()

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
