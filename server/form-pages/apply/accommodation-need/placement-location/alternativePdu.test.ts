import { createMock } from '@golevelup/ts-jest'
import { applicationFactory, referenceDataFactory } from '../../../../testutils/factories'
import { itShouldHavePreviousValue } from '../../../shared-examples'
import AlternativePdu, { AlternativePduBody } from './alternativePdu'
import { ReferenceDataService } from '../../../../services'
import { CallConfig } from '../../../../data/restClient'
import { buildUniqueList } from '../../../../testutils/utils'

describe('AlternativePdu', () => {
  const application = applicationFactory.build({
    data: {
      'placement-location': {
        'alternative-region': {
          regionName: 'East Midlands',
        },
      },
    },
  })
  const pdus = buildUniqueList(referenceDataFactory.pdu(), pdu => pdu.id, 3)
  const body: AlternativePduBody = { alternativePdu: 'yes', pduId: pdus[1].id, pduName: pdus[1].name }

  describe('initialize', () => {
    it('returns the page with all PDUs fetched from the API', async () => {
      const callConfig = { token: 'some-token', probationRegion: { id: '1', name: 'East Midlands' } } as CallConfig
      const getPdusMock = jest.fn().mockResolvedValue(pdus)
      const referenceDataService = createMock<ReferenceDataService>({
        getPdus: getPdusMock,
      })

      const page = await AlternativePdu.initialize({} as AlternativePduBody, application, callConfig, {
        referenceDataService,
      })

      expect(getPdusMock).toHaveBeenCalledWith(callConfig, { regional: true })
      expect(page).toBeInstanceOf(AlternativePdu)
      expect(page.pdus).toEqual(pdus)
    })
  })

  describe('body', () => {
    it('sets the body to the existing value', () => {
      const page = new AlternativePdu(body, application, pdus)

      expect(page.body).toEqual(body)
    })

    it('sets the body based on the value submitted and the PDUs from the API', () => {
      const page = new AlternativePdu({}, application, pdus)

      page.body = { alternativePdu: 'yes', pduId: pdus[0].id }

      expect(page.body).toEqual({
        alternativePdu: 'yes',
        pduId: pdus[0].id,
        pduName: pdus[0].name,
      })
    })

    it('clears any previously selected PDU if the answer is no', () => {
      const page = new AlternativePdu(body, application, pdus)

      page.body = { ...body, alternativePdu: 'no' }

      expect(page.body).toEqual({
        alternativePdu: 'no',
      })
    })
  })

  itShouldHavePreviousValue(new AlternativePdu({}, application, pdus), 'dashboard')

  describe('next', () => {
    it('returns the different pdu reason page ID if the answer is yes', () => {
      const page = new AlternativePdu(body, application, pdus)

      expect(page.next()).toEqual('alternative-pdu-reason')
    })

    it('returns a blank string for the task list if the answer is no', () => {
      const page = new AlternativePdu({ alternativePdu: 'no' }, application, pdus)

      expect(page.next()).toEqual('')
    })
  })

  describe('errors', () => {
    it('returns no error if the different pdu fields are populated', () => {
      const page = new AlternativePdu(body, application, pdus)

      expect(page.errors()).toEqual({})
    })

    it('returns no error if the different pdu answer is no', () => {
      const page = new AlternativePdu({ alternativePdu: 'no' }, application, pdus)

      expect(page.errors()).toEqual({})
    })

    it('returns an error if the different pdu answer is not populated', () => {
      const page = new AlternativePdu({ ...body, alternativePdu: undefined }, application, pdus)

      expect(page.errors()).toEqual({
        alternativePdu: 'Select yes if the placement is required in an different PDU',
      })
    })

    it('returns an error if the different pdu answer is yes but PDU is not selected', () => {
      const page = new AlternativePdu({ alternativePdu: 'yes', pduId: undefined }, application, pdus)
      const region = application.data?.['placement-location']?.['alternative-region']?.regionName || ''
      page.regionName = region
      expect(page.errors()).toEqual({
        pduId: `Enter a PDU in ${region}`,
      })
    })
  })

  describe('response', () => {
    it('returns a translated version of the response when answered yes', () => {
      const page = new AlternativePdu(body, application, pdus)
      const region = application.data?.['placement-location']?.['alternative-region']?.regionName || ''
      expect(page.response()).toEqual({
        'Is placement required in a different PDU?': 'Yes',
        [`PDU in ${region}`]: pdus[1].name,
      })
    })

    it('returns a translated version of the response when answered no', () => {
      const page = new AlternativePdu({ alternativePdu: 'no' }, application, pdus)

      expect(page.response()).toEqual({
        'Is placement required in a different PDU?': 'No',
      })
    })
  })

  describe('getAllPdus', () => {
    it('returns the PDUs formatted for use in a select element', () => {
      const page = new AlternativePdu(body, application, pdus)

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
