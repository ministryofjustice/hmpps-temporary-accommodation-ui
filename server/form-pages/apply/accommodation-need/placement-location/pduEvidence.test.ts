import { ReferenceDataService } from 'server/services'
import { createMock } from '@golevelup/ts-jest'
import { CallConfig } from '../../../../data/restClient'
import { applicationFactory } from '../../../../testutils/factories'
import { isFullPerson } from '../../../../utils/personUtils'
import PduEvidence from './pduEvidence'

describe('PduEvidence', () => {
  const application = applicationFactory.build()
  const body = { pduEvidence: 'yes' as const }

  describe('constructor', () => {
    it('sets the title and htmlDocumentTitle with the person name', () => {
      const page = new PduEvidence(body, application)
      if (isFullPerson(application.person)) {
        expect(page.title).toContain(application.person.name)
      }
      expect(page.htmlDocumentTitle).toEqual(page.title)
    })

    it('sets the body', () => {
      const page = new PduEvidence(body, application)
      expect(page.body).toEqual(body)
    })
  })

  describe('initialize', () => {
    const callConfig = {} as CallConfig
    const regions = [
      { id: '1', name: 'London', hptEmail: 'london.test@justice.gov.uk' },
      { id: '2', name: 'East Midlands', hptEmail: 'east.midlands.test@justice.gov.uk' },
    ]

    const getProbationRegionsMock = jest.fn().mockResolvedValue(regions)
    const referenceDataService = createMock<ReferenceDataService>({
      getProbationRegions: getProbationRegionsMock,
    })

    it('sets regionName and email when region is found', async () => {
      application.data = {
        'placement-location': {
          'different-region': { regionName: 'London' },
          'placement-pdu': { pduName: 'Croydon' },
        },
      }

      const instance = await PduEvidence.initialize(body, application, callConfig, {
        referenceDataService,
      })
      expect(instance.regionName).toBe('London')
      expect(instance.email).toBe('london.test@justice.gov.uk')
    })

    it('sets email to empty string when region is not found', async () => {
      application.data = {
        'placement-location': {
          'different-region': { regionName: 'West Midlands' },
          'placement-pdu': { pduName: 'Coventry' },
        },
      }

      const instance = await PduEvidence.initialize(body, application, callConfig, {
        referenceDataService,
      })
      expect(instance.regionName).toBe('West Midlands')
      expect(instance.email).toBe('')
    })
  })

  describe('response', () => {
    it('returns a translated response when answered yes', () => {
      const page = new PduEvidence({ pduEvidence: 'yes' }, application)
      expect(page.response()).toEqual({
        'Is there evidence in NDelius that the PDU will consider a CAS3 bedspace?': 'Yes',
      })
    })

    it('returns an empty object when answered no', () => {
      const page = new PduEvidence({ pduEvidence: 'no' }, application)
      expect(page.response()).toEqual({})
    })

    it('returns an empty object when unanswered', () => {
      const page = new PduEvidence({}, application)
      expect(page.response()).toEqual({})
    })
  })

  describe('next', () => {
    it('returns "" if the answer is yes', () => {
      const page = new PduEvidence({ pduEvidence: 'yes' }, application)
      expect(page.next()).toEqual('')
    })

    it('returns "needs-evidence" if the answer is no', () => {
      const page = new PduEvidence({ pduEvidence: 'no' }, application)
      expect(page.next()).toEqual('needs-evidence')
    })

    it('returns "needs-evidence" if unanswered', () => {
      const page = new PduEvidence({}, application)
      expect(page.next()).toEqual('needs-evidence')
    })
  })

  describe('errors', () => {
    it('returns no error if pduEvidence is populated', () => {
      const page = new PduEvidence({ pduEvidence: 'yes' }, application)
      expect(page.errors()).toEqual({})
    })

    it('returns an error if pduEvidence is not populated', () => {
      const page = new PduEvidence({}, application)
      expect(page.errors()).toEqual({
        pduEvidence: 'Select yes if the evidence is in NDelius',
      })
    })
  })

  describe('previous', () => {
    it('returns "placement-pdu"', () => {
      const page = new PduEvidence(body, application)
      expect(page.previous()).toEqual('placement-pdu')
    })
  })
})
