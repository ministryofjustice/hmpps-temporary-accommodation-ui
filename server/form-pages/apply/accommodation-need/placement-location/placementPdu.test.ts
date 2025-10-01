import { createMock } from '@golevelup/ts-jest'
import { ReferenceDataService } from 'server/services'
import { applicationFactory, referenceDataFactory } from '../../../../testutils/factories'
import PlacementPdu, { PlacementPduBody } from './placementPdu'
import { buildUniqueList } from '../../../../testutils/utils'
import { isFullPerson } from '../../../../utils/personUtils'

describe('PlacementPdu', () => {
  const application = applicationFactory.build({
    data: {
      'placement-location': {
        'different-region': {
          regionName: 'East Midlands',
        },
      },
    },
  })
  const pdus = buildUniqueList(referenceDataFactory.pdu(), pdu => pdu.id, 3)
  const body: PlacementPduBody = {
    regionId: 'east-midlands',
    alternativePdu: 'no',
    pduId: pdus[1].id,
    pduName: pdus[1].name,
  }

  describe('constructor', () => {
    it('sets the title and htmlDocumentTitle with the person name', () => {
      const page = new PlacementPdu(body, application, pdus)
      if (isFullPerson(application.person)) {
        expect(page.title).toContain(application.person.name)
      }
      expect(page.htmlDocumentTitle).toEqual(page.title)
    })

    it('sets the regionName from application data', () => {
      application.data = {
        'placement-location': {
          'different-region': { regionName: 'East Midlands' },
        },
      }
      const page = new PlacementPdu(body, application, pdus)
      expect(page.regionName).toEqual('East Midlands')
    })
  })

  describe('initialize', () => {
    it('fetches PDUs for the region and returns a PlacementPdu instance', async () => {
      const callConfig = { token: 'some-token' }
      const getPdusMock = jest.fn().mockResolvedValue(pdus)
      const referenceDataService = createMock<ReferenceDataService>({ getPdus: getPdusMock })

      application.data = {
        'placement-location': {
          'different-region': { regionId: 'east-midlands' },
        },
      }

      const page = await PlacementPdu.initialize({} as PlacementPduBody, application, callConfig, {
        referenceDataService,
      })
      expect(getPdusMock).toHaveBeenCalledWith(callConfig, { regional: true, regionId: 'east-midlands' })
      expect(page).toBeInstanceOf(PlacementPdu)
      expect(page.pdus).toEqual(pdus)
    })
  })

  describe('body', () => {
    it('returns the current body', () => {
      const page = new PlacementPdu(body, application, pdus)
      expect(page.body).toEqual(body)
    })

    it('sets the body based on the value submitted and the PDUs from the API', () => {
      const page = new PlacementPdu({}, application, pdus)
      page.body = { pduId: pdus[0].id, regionId: 'east-midlands' }
      expect(page.body).toEqual({
        pduId: pdus[0].id,
        pduName: pdus[0].name,
        regionId: 'east-midlands',
      })
    })
  })

  describe('response', () => {
    it('returns a translated response', () => {
      const page = new PlacementPdu(body, application, pdus)
      expect(page.response()).toEqual({
        'Which PDU should the person be placed in?': pdus[1].name,
      })
    })
  })

  describe('previous', () => {
    it('returns "different-region"', () => {
      const page = new PlacementPdu(body, application, pdus)
      expect(page.previous()).toEqual('different-region')
    })
  })

  describe('next', () => {
    it('returns "pdu-evidence"', () => {
      const page = new PlacementPdu(body, application, pdus)
      expect(page.next()).toEqual('pdu-evidence')
    })
  })

  describe('errors', () => {
    it('returns no error if pduId is populated', () => {
      const page = new PlacementPdu(body, application, pdus)
      expect(page.errors()).toEqual({})
    })

    it('returns an error if pduId is not populated', () => {
      const page = new PlacementPdu({}, application, pdus)
      const region = application.data?.['placement-location']?.['alternative-region']?.regionName || ''
      expect(page.errors()).toEqual({
        pduId: `Enter a PDU in ${region}`,
      })
    })
  })

  describe('getAllPdus', () => {
    it('returns the PDUs formatted for use in a select element', () => {
      const page = new PlacementPdu(body, application, pdus)
      expect(page.getAllPdus()).toEqual([
        {
          value: '',
          text: 'Select an option',
        },
        {
          value: pdus[0].id,
          text: pdus[0].name,
          selected: false,
        },
        {
          value: pdus[1].id,
          text: pdus[1].name,
          selected: true,
        },
        {
          value: pdus[2].id,
          text: pdus[2].name,
          selected: false,
        },
      ])
    })
  })
})
