import PremisesService from './premisesService'
import PremisesClient from '../data/premisesClient'
import ReferenceDataClient from '../data/referenceDataClient'
import premisesFactory from '../testutils/factories/premises'
import localAuthorityFactory from '../testutils/factories/localAuthority'
import dateCapacityFactory from '../testutils/factories/dateCapacity'
import staffMemberFactory from '../testutils/factories/staffMember'
import newPremisesFactory from '../testutils/factories/newPremises'
import updatePremisesFactory from '../testutils/factories/updatePremises'
import characteristicFactory from '../testutils/factories/characteristic'
import { formatStatus, getDateRangesWithNegativeBeds } from '../utils/premisesUtils'
import paths from '../paths/temporary-accommodation/manage'
import { escape, formatLines } from '../utils/viewUtils'
import { filterCharacteristics, formatCharacteristics } from '../utils/characteristicUtils'
import probationRegionFactory from '../testutils/factories/probationRegion'
import pduFactory from '../testutils/factories/pdu'
import pduJson from '../data/pdus.json'
import { CallConfig } from '../data/restClient'

jest.mock('../data/premisesClient')
jest.mock('../data/referenceDataClient')
jest.mock('../utils/premisesUtils')
jest.mock('../utils/viewUtils')
jest.mock('../utils/characteristicUtils')
jest.mock('../data/pdus.json', () => {
  return []
})

describe('PremisesService', () => {
  const premisesClient = new PremisesClient(null) as jest.Mocked<PremisesClient>
  const referenceDataClient = new ReferenceDataClient(null) as jest.Mocked<ReferenceDataClient>

  const premisesClientFactory = jest.fn()
  const referenceDataClientFactory = jest.fn()

  const service = new PremisesService(premisesClientFactory, referenceDataClientFactory)

  const callConfig = { token: 'some-token' } as CallConfig
  const premisesId = 'premisesId'

  beforeEach(() => {
    jest.resetAllMocks()
    premisesClientFactory.mockReturnValue(premisesClient)
    referenceDataClientFactory.mockReturnValue(referenceDataClient)
  })

  describe('getStaffMembers', () => {
    it('on success returns the person given their CRN', async () => {
      const staffMembers = staffMemberFactory.buildList(5)
      premisesClient.getStaffMembers.mockResolvedValue(staffMembers)

      const result = await service.getStaffMembers(callConfig, premisesId)

      expect(result).toEqual(staffMembers)

      expect(premisesClientFactory).toHaveBeenCalledWith(callConfig)
      expect(premisesClient.getStaffMembers).toHaveBeenCalledWith(premisesId)
    })
  })

  describe('getReferenceData', () => {
    it('returns sorted premises reference data', async () => {
      const localAuthority1 = localAuthorityFactory.build({ name: 'ABC' })
      const localAuthority2 = localAuthorityFactory.build({ name: 'HIJ' })
      const localAuthority3 = localAuthorityFactory.build({ name: 'XYZ' })

      const premisesCharacteristic1 = characteristicFactory.build({ name: 'ABC', modelScope: 'premises' })
      const premisesCharacteristic2 = characteristicFactory.build({ name: 'EFG', modelScope: 'premises' })
      const genericCharacteristic = characteristicFactory.build({ name: 'HIJ', modelScope: '*' })
      const otherCharacteristic = characteristicFactory.build({ name: 'LMN', modelScope: 'other' })

      const probationRegion1 = probationRegionFactory.build({ name: 'EFG' })
      const probationRegion2 = probationRegionFactory.build({ name: 'PQR' })
      const probationRegion3 = probationRegionFactory.build({ name: 'UVW' })

      const pdu1 = pduFactory.build({ name: 'HIJ' })
      const pdu2 = pduFactory.build({ name: 'LMN' })
      const pdu3 = pduFactory.build({ name: 'PQR' })

      referenceDataClient.getReferenceData.mockImplementation(async (objectType: string) => {
        if (objectType === 'local-authority-areas') {
          return [localAuthority3, localAuthority1, localAuthority2]
        }
        if (objectType === 'characteristics') {
          return [genericCharacteristic, premisesCharacteristic2, premisesCharacteristic1, otherCharacteristic]
        }
        return [probationRegion2, probationRegion1, probationRegion3]
      })

      pduJson.length = 0
      pduJson.push(pdu2, pdu3, pdu1)
      ;(filterCharacteristics as jest.MockedFunction<typeof filterCharacteristics>).mockReturnValue([
        genericCharacteristic,
        premisesCharacteristic2,
        premisesCharacteristic1,
      ])

      const result = await service.getReferenceData(callConfig)
      expect(result).toEqual({
        localAuthorities: [localAuthority1, localAuthority2, localAuthority3],
        characteristics: [premisesCharacteristic1, premisesCharacteristic2, genericCharacteristic],
        probationRegions: [probationRegion1, probationRegion2, probationRegion3],
        pdus: [pdu1, pdu2, pdu3],
      })

      expect(referenceDataClient.getReferenceData).toHaveBeenCalledWith('local-authority-areas')
      expect(referenceDataClient.getReferenceData).toHaveBeenCalledWith('characteristics')
      expect(referenceDataClient.getReferenceData).toHaveBeenCalledWith('probation-regions')

      expect(filterCharacteristics).toHaveBeenCalledWith(
        [genericCharacteristic, premisesCharacteristic2, premisesCharacteristic1, otherCharacteristic],
        'premises',
      )
    })
  })

  describe('tableRows', () => {
    it('returns a sorted table view of the premises for Temporary Accommodation', async () => {
      const premises1 = premisesFactory.build({ addressLine1: 'ABC', postcode: '123' })
      const premises2 = premisesFactory.build({ addressLine1: 'GHI', postcode: '123' })
      const premises3 = premisesFactory.build({ addressLine1: 'GHI', postcode: '456' })
      const premises4 = premisesFactory.build({ addressLine1: 'XYZ', postcode: '123' })

      const premises = [premises4, premises1, premises3, premises2]
      premisesClient.all.mockResolvedValue(premises)

      const rows = await service.tableRows(callConfig)

      expect(rows).toEqual([
        [
          {
            text: 'ABC, 123',
          },
          {
            text: premises1.bedCount.toString(),
          },
          {
            text: premises1.pdu,
          },
          {
            html: `<a href="${paths.premises.show({
              premisesId: premises1.id,
            })}">Manage<span class="govuk-visually-hidden"> ABC, 123</span></a>`,
          },
        ],
        [
          {
            text: 'GHI, 123',
          },
          {
            text: premises2.bedCount.toString(),
          },
          {
            text: premises2.pdu,
          },
          {
            html: `<a href="${paths.premises.show({
              premisesId: premises2.id,
            })}">Manage<span class="govuk-visually-hidden"> GHI, 123</span></a>`,
          },
        ],
        [
          {
            text: 'GHI, 456',
          },
          {
            text: premises3.bedCount.toString(),
          },
          {
            text: premises3.pdu,
          },
          {
            html: `<a href="${paths.premises.show({
              premisesId: premises3.id,
            })}">Manage<span class="govuk-visually-hidden"> GHI, 456</span></a>`,
          },
        ],
        [
          {
            text: 'XYZ, 123',
          },
          {
            text: premises4.bedCount.toString(),
          },
          {
            text: premises4.pdu,
          },
          {
            html: `<a href="${paths.premises.show({
              premisesId: premises4.id,
            })}">Manage<span class="govuk-visually-hidden"> XYZ, 123</span></a>`,
          },
        ],
      ])

      expect(premisesClientFactory).toHaveBeenCalledWith(callConfig)
      expect(premisesClient.all).toHaveBeenCalled()
    })
  })

  describe('getPremisesSelectList', () => {
    it('returns the list mapped into the format required by the nunjucks macro and sorted alphabetically', async () => {
      const premisesA = premisesFactory.build({ name: 'a' })
      const premisesB = premisesFactory.build({ name: 'b' })
      const premisesC = premisesFactory.build({ name: 'c' })
      premisesClient.all.mockResolvedValue([premisesC, premisesB, premisesA])

      const result = await service.getPremisesSelectList(callConfig)

      expect(result).toEqual([
        { text: premisesA.name, value: premisesA.id },
        { text: premisesB.name, value: premisesB.id },
        { text: premisesC.name, value: premisesC.id },
      ])

      expect(premisesClientFactory).toHaveBeenCalledWith(callConfig)
      expect(premisesClient.all).toHaveBeenCalled()
    })
  })

  describe('getUpdatePremises', () => {
    it('finds the premises given by the premises ID, and returns the premises as an UpdatePremises', async () => {
      const premises = premisesFactory.build({
        localAuthorityArea: localAuthorityFactory.build({
          name: 'Local authority',
          id: 'local-authority',
        }),
        characteristics: [
          characteristicFactory.build({
            name: 'Characteristic A',
            id: 'characteristic-a',
          }),
          characteristicFactory.build({
            name: 'Characteristic B',
            id: 'characteristic-b',
          }),
        ],
        probationRegion: probationRegionFactory.build({
          name: 'A probation region',
          id: 'a-probation-region',
        }),
      })

      premisesClient.find.mockResolvedValue(premises)

      const result = await service.getUpdatePremises(callConfig, premises.id)
      expect(result).toEqual({
        ...premises,
        localAuthorityAreaId: 'local-authority',
        characteristicIds: ['characteristic-a', 'characteristic-b'],
        probationRegionId: 'a-probation-region',
      })

      expect(premisesClient.find).toHaveBeenCalledWith(premises.id)
    })
  })

  describe('getPremises', () => {
    it('returns the premises for the given premises ID', async () => {
      const premises = premisesFactory.build()
      premisesClient.find.mockResolvedValue(premises)

      const result = await service.getPremises(callConfig, premises.id)

      expect(result).toEqual(premises)

      expect(premisesClientFactory).toHaveBeenCalledWith(callConfig)
      expect(premisesClient.find).toHaveBeenCalledWith(premises.id)
    })
  })

  describe('getPremisesDetails', () => {
    it('returns a Premises and a summary list for a given Premises ID', async () => {
      const premises = premisesFactory.build({
        name: 'Test',
        addressLine1: '10 Example Street',
        addressLine2: '',
        town: 'Example Town',
        postcode: 'SW1A 1AA',
        bedCount: 50,
        availableBedsForToday: 20,
        localAuthorityArea: localAuthorityFactory.build({
          name: 'Test Authority',
        }),
        characteristics: [
          characteristicFactory.build({
            name: 'A characteristic',
          }),
        ],
        probationRegion: probationRegionFactory.build({
          name: 'A probation region',
        }),
        pdu: 'A PDU',
        status: 'active',
        notes: 'Some notes',
      })

      premisesClient.find.mockResolvedValue(premises)
      ;(escape as jest.MockedFunction<typeof escape>).mockImplementation(text => text)
      ;(formatLines as jest.MockedFunction<typeof escape>).mockImplementation(text => text)
      ;(formatCharacteristics as jest.MockedFunction<typeof formatCharacteristics>).mockImplementation(() => ({
        text: 'Some attributes',
      }))
      ;(formatStatus as jest.MockedFn<typeof formatStatus>).mockReturnValue('Online')

      const result = await service.getPremisesDetails(callConfig, premises.id)

      expect(result).toEqual({
        premises,
        summaryList: {
          rows: [
            {
              key: { text: 'Address' },
              value: { html: '10 Example Street<br />Example Town<br />SW1A 1AA' },
            },
            {
              key: { text: 'Local authority' },
              value: { text: 'Test Authority' },
            },
            {
              key: { text: 'Probation region' },
              value: { text: 'A probation region' },
            },
            {
              key: { text: 'PDU' },
              value: { text: 'A PDU' },
            },
            {
              key: { text: 'Attributes' },
              value: { text: 'Some attributes' },
            },
            {
              key: { text: 'Status' },
              value: { text: 'Online' },
            },
            {
              key: { text: 'Notes' },
              value: { html: 'Some notes' },
            },
          ],
        },
      })

      expect(premisesClientFactory).toHaveBeenCalledWith(callConfig)
      expect(premisesClient.find).toHaveBeenCalledWith(premises.id)

      expect(escape).toHaveBeenCalledWith('10 Example Street')
      expect(escape).toHaveBeenCalledWith('Example Town')
      expect(escape).toHaveBeenCalledWith('SW1A 1AA')
      expect(formatLines).toHaveBeenCalledWith('Some notes')
      expect(formatCharacteristics).toHaveBeenCalledWith([
        expect.objectContaining({
          name: 'A characteristic',
        }),
      ])
      expect(formatStatus).toHaveBeenCalledWith('active')
    })
  })

  describe('getOvercapacityMessage', () => {
    it('returns an empty string if not passed any dates', async () => {
      premisesClient.capacity.mockResolvedValue([])
      ;(getDateRangesWithNegativeBeds as jest.Mock).mockReturnValue([])

      const result = await service.getOvercapacityMessage(callConfig, premisesId)

      expect(result).toBe('')
    })
    it('returns an empty string if passed dates that are not overcapacity', async () => {
      premisesClient.capacity.mockResolvedValue([
        dateCapacityFactory.build({ date: new Date(2023, 0, 1).toISOString(), availableBeds: 1 }),
        dateCapacityFactory.build({ date: new Date(2023, 1, 1).toISOString(), availableBeds: 2 }),
        dateCapacityFactory.build({ date: new Date(2023, 1, 2).toISOString(), availableBeds: 3 }),
        dateCapacityFactory.build({ date: new Date(2023, 2, 2).toISOString(), availableBeds: 4 }),
        dateCapacityFactory.build({ date: new Date(2023, 3, 2).toISOString(), availableBeds: 5 }),
      ])
      ;(getDateRangesWithNegativeBeds as jest.Mock).mockReturnValue([])

      const result = await service.getOvercapacityMessage(callConfig, premisesId)

      expect(result).toBe('')
    })

    it('returns the correct string if passed a single date', async () => {
      const capacityStub = [
        dateCapacityFactory.build({
          date: new Date(2022, 0, 1).toISOString(),
          availableBeds: -1,
        }),
      ]
      premisesClient.capacity.mockResolvedValue(capacityStub)
      ;(getDateRangesWithNegativeBeds as jest.Mock).mockReturnValue([{ start: capacityStub[0].date }])

      const result = await service.getOvercapacityMessage(callConfig, premisesId)

      expect(result).toEqual([
        '<h4 class="govuk-!-margin-top-0 govuk-!-margin-bottom-2">The premises is over capacity on 1 January 2022</h4>',
      ])
    })

    it('returns the correct string if passed a single date range', async () => {
      const capacityStub = [
        dateCapacityFactory.build({
          date: new Date(2022, 0, 1).toISOString(),
          availableBeds: -1,
        }),
        dateCapacityFactory.build({
          date: new Date(2022, 1, 1).toISOString(),
          availableBeds: -1,
        }),
      ]
      premisesClient.capacity.mockResolvedValue(capacityStub)
      ;(getDateRangesWithNegativeBeds as jest.Mock).mockReturnValue([
        {
          start: capacityStub[0].date,
          end: capacityStub[1].date,
        },
      ])

      const result = await service.getOvercapacityMessage(callConfig, premisesId)

      expect(result).toEqual([
        '<h4 class="govuk-!-margin-top-0 govuk-!-margin-bottom-2">The premises is over capacity for the period 1 January 2022 to 1 February 2022</h4>',
      ])
    })

    it('if there are multiple date ranges it returns the correct markup', async () => {
      const capacityStub = [
        dateCapacityFactory.build({ date: new Date(2023, 0, 1).toISOString(), availableBeds: -1 }),
        dateCapacityFactory.build({ date: new Date(2023, 1, 1).toISOString(), availableBeds: -1 }),
        dateCapacityFactory.build({ date: new Date(2023, 1, 2).toISOString(), availableBeds: 1 }),
        dateCapacityFactory.build({ date: new Date(2023, 2, 2).toISOString(), availableBeds: -1 }),
        dateCapacityFactory.build({ date: new Date(2023, 3, 2).toISOString(), availableBeds: -1 }),
      ]
      premisesClient.capacity.mockResolvedValue(capacityStub)
      ;(getDateRangesWithNegativeBeds as jest.Mock).mockReturnValue([
        {
          start: capacityStub[0].date,
          end: capacityStub[1].date,
        },
        {
          start: capacityStub[3].date,
          end: capacityStub[4].date,
        },
      ])

      const result = await service.getOvercapacityMessage(callConfig, premisesId)

      expect(result).toEqual([
        `<h4 class="govuk-!-margin-top-0 govuk-!-margin-bottom-2">The premises is over capacity for the periods:</h4>
        <ul class="govuk-list govuk-list--bullet"><li>1 January 2023 to 1 February 2023</li><li>2 March 2023 to 2 April 2023</li></ul>`,
      ])
    })

    it('if there is a date ranges and a single date it returns the correct markup', async () => {
      const capacityStub = [
        dateCapacityFactory.build({ date: new Date(2023, 0, 1).toISOString(), availableBeds: -1 }),
        dateCapacityFactory.build({ date: new Date(2023, 1, 2).toISOString(), availableBeds: 1 }),
        dateCapacityFactory.build({ date: new Date(2023, 2, 2).toISOString(), availableBeds: -1 }),
        dateCapacityFactory.build({ date: new Date(2023, 3, 2).toISOString(), availableBeds: -1 }),
      ]
      premisesClient.capacity.mockResolvedValue(capacityStub)
      ;(getDateRangesWithNegativeBeds as jest.Mock).mockReturnValue([
        {
          start: capacityStub[0].date,
        },
        {
          start: capacityStub[2].date,
          end: capacityStub[3].date,
        },
      ])
      const result = await service.getOvercapacityMessage(callConfig, premisesId)

      expect(result).toEqual([
        `<h4 class="govuk-!-margin-top-0 govuk-!-margin-bottom-2">The premises is over capacity for the periods:</h4>
        <ul class="govuk-list govuk-list--bullet"><li>1 January 2023</li><li>2 March 2023 to 2 April 2023</li></ul>`,
      ])
    })
  })

  describe('create', () => {
    it('on success returns the premises that has been created', async () => {
      const premises = premisesFactory.build()
      const newPremises = newPremisesFactory.build({
        name: premises.name,
        postcode: premises.postcode,
      })
      premisesClient.create.mockResolvedValue(premises)

      const createdPremises = await service.create(callConfig, newPremises)
      expect(createdPremises).toEqual(premises)

      expect(premisesClientFactory).toHaveBeenCalledWith(callConfig)
      expect(premisesClient.create).toHaveBeenCalledWith(newPremises)
    })
  })

  describe('update', () => {
    it('on success updates the premises and returns the updated premises', async () => {
      const premises = premisesFactory.build()
      const newPremises = updatePremisesFactory.build({
        postcode: premises.postcode,
        notes: premises.notes,
      })
      premisesClient.update.mockResolvedValue(premises)

      const updatedPremises = await service.update(callConfig, premises.id, newPremises)
      expect(updatedPremises).toEqual(premises)

      expect(premisesClientFactory).toHaveBeenCalledWith(callConfig)
      expect(premisesClient.update).toHaveBeenCalledWith(premises.id, newPremises)
    })
  })
})
