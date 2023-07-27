import { PersonRisksUI } from '../../../../@types/ui'
import { applicationFactory, personFactory } from '../../../../testutils/factories'
import { mapApiPersonRisksForUi } from '../../../../utils/utils'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'
import {
  personRisksFlagsResponse,
  personRisksMappaResponse,
  personRisksRoshResponse,
  yesOrNoResponseWithDetail,
} from '../../../utils'
import ApprovalsForSpecificRisks from './approvalsForSpecificRisks'

jest.mock('../../../../utils/utils')
jest.mock('../../../utils')

const body = { approvals: 'yes' as const, approvalsDetail: 'Some detail' }
const personRisksUi = { flags: { value: ['Some flag'] } } as PersonRisksUI

describe('ApprovalsForSpecificRisks', () => {
  const application = applicationFactory.build({
    person: personFactory.build({
      name: 'John Smith',
    }),
  })

  describe('constructor', () => {
    it('sets the body and risk information', () => {
      ;(mapApiPersonRisksForUi as jest.MockedFunction<typeof mapApiPersonRisksForUi>).mockReturnValue(personRisksUi)

      const page = new ApprovalsForSpecificRisks(body, application)

      expect(page.body).toEqual(body)
      expect(page.risks).toEqual(personRisksUi)

      expect(mapApiPersonRisksForUi).toHaveBeenCalledWith(application.risks)
    })
  })

  itShouldHavePreviousValue(new ApprovalsForSpecificRisks({}, application), 'dashboard')
  itShouldHaveNextValue(new ApprovalsForSpecificRisks({}, application), '')

  describe('errors', () => {
    it('returns an empty object if the approvals fields are populated', () => {
      const page = new ApprovalsForSpecificRisks(body, application)
      expect(page.errors()).toEqual({})
    })

    it("returns an empty object if the approvals answer answer is 'not required'", () => {
      const page = new ApprovalsForSpecificRisks({ approvals: 'notRequired' }, application)
      expect(page.errors()).toEqual({})
    })

    it("returns an empty object if the approvals answer answer is 'needs address'", () => {
      const page = new ApprovalsForSpecificRisks({ approvals: 'needsAddress' }, application)
      expect(page.errors()).toEqual({})
    })

    it('returns an error if the approvals answer not populated', () => {
      const page = new ApprovalsForSpecificRisks({}, application)
      expect(page.errors()).toEqual({
        approvals: 'You must specify if you have reveived approval for this application',
      })
    })

    it('returns an error if approvals answer is yes but details are not populated', () => {
      const page = new ApprovalsForSpecificRisks({ ...body, approvalsDetail: undefined }, application)
      expect(page.errors()).toEqual({
        approvalsDetail: 'You must provide details of who gave approval and the date it was given',
      })
    })
  })

  describe('response', () => {
    const roshResponse = {
      'RoSH key': 'Some value',
    }
    const mappaResponse = {
      'MAPPA key': 'Some value',
    }
    const flagsResponse = {
      'Flags key': 'Some value',
    }

    beforeEach(() => {
      ;(personRisksRoshResponse as jest.MockedFunction<typeof personRisksRoshResponse>).mockReturnValue(roshResponse)
      ;(personRisksMappaResponse as jest.MockedFunction<typeof personRisksRoshResponse>).mockReturnValue(mappaResponse)
      ;(personRisksFlagsResponse as jest.MockedFunction<typeof personRisksRoshResponse>).mockReturnValue(flagsResponse)
    })

    it('returns a translated version of the response when the approvals answer is yes', () => {
      ;(mapApiPersonRisksForUi as jest.MockedFunction<typeof mapApiPersonRisksForUi>).mockReturnValue(personRisksUi)
      ;(yesOrNoResponseWithDetail as jest.MockedFunction<typeof yesOrNoResponseWithDetail>).mockReturnValue(
        'Response with optional detail',
      )

      const page = new ApprovalsForSpecificRisks(body, application)
      expect(page.response()).toEqual({
        'Have your received approval for this referral?': 'Response with optional detail',
        ...roshResponse,
        ...mappaResponse,
        ...flagsResponse,
      })
      expect(yesOrNoResponseWithDetail).toHaveBeenCalledWith('approvals', body)
    })

    it("returns a translated version of the response when the approvals answer is 'needs address'", () => {
      ;(mapApiPersonRisksForUi as jest.MockedFunction<typeof mapApiPersonRisksForUi>).mockReturnValue(personRisksUi)

      const page = new ApprovalsForSpecificRisks({ approvals: 'needsAddress' }, application)
      expect(page.response()).toEqual({
        'Have your received approval for this referral?':
          'No, approval is required once an address is proposed by the HPT',
        ...roshResponse,
        ...mappaResponse,
        ...flagsResponse,
      })
    })
  })

  describe('items', () => {
    it('returns radio button items with any additional condition detail text', () => {
      const page = new ApprovalsForSpecificRisks(body, application)
      expect(page.items()).toEqual(
        expect.arrayContaining([
          {
            value: 'needsAddress',
            text: 'No, approval is required once an address is proposed by the HPT',
          },
        ]),
      )
    })
  })
})
