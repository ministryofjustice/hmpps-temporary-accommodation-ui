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
import { getDateRangesWithNegativeBeds, formatStatus } from '../utils/premisesUtils'
import paths from '../paths/temporary-accommodation/manage'
import { escape, formatLines } from '../utils/viewUtils'
import { formatCharacteristics, filterAndSortCharacteristics } from '../utils/characteristicUtils'

jest.mock('../data/premisesClient')
jest.mock('../data/referenceDataClient')
jest.mock('../utils/premisesUtils')
jest.mock('../utils/viewUtils')
jest.mock('../utils/characteristicUtils')

describe('PremisesService', () => {
  const premisesClient = new PremisesClient(null) as jest.Mocked<PremisesClient>
  const referenceDataClient = new ReferenceDataClient(null) as jest.Mocked<ReferenceDataClient>

  const premisesClientFactory = jest.fn()
  const referenceDataFactory = jest.fn()

  const service = new PremisesService(premisesClientFactory, referenceDataFactory)

  const token = 'SOME_TOKEN'
  const premisesId = 'premisesId'

  beforeEach(() => {
    jest.resetAllMocks()
    premisesClientFactory.mockReturnValue(premisesClient)
    referenceDataFactory.mockReturnValue(referenceDataClient)
  })

  describe('getStaffMembers', () => {
    it('on success returns the person given their CRN', async () => {
      const staffMembers = staffMemberFactory.buildList(5)
      premisesClient.getStaffMembers.mockResolvedValue(staffMembers)

      const result = await service.getStaffMembers(token, premisesId)

      expect(result).toEqual(staffMembers)

      expect(premisesClientFactory).toHaveBeenCalledWith(token)
      expect(premisesClient.getStaffMembers).toHaveBeenCalledWith(premisesId)
    })
  })

  describe('getPremisesCharacteristics', () => {
    it('returns prepared premises characteristics', async () => {
      const premisesCharacteristic1 = characteristicFactory.build({ name: 'ABC', modelScope: 'premises' })
      const premisesCharacteristic2 = characteristicFactory.build({ name: 'EFG', modelScope: 'premises' })
      const genericCharacteristic = characteristicFactory.build({ name: 'HIJ', modelScope: '*' })
      const otherCharacteristic = characteristicFactory.build({ name: 'LMN', modelScope: 'other' })

      referenceDataClient.getReferenceData.mockResolvedValue([
        genericCharacteristic,
        premisesCharacteristic2,
        premisesCharacteristic1,
        otherCharacteristic,
      ])
      ;(filterAndSortCharacteristics as jest.MockedFunction<typeof filterAndSortCharacteristics>).mockReturnValue([
        premisesCharacteristic1,
        premisesCharacteristic2,
        genericCharacteristic,
      ])

      const result = await service.getPremisesCharacteristics(token)
      expect(result).toEqual([premisesCharacteristic1, premisesCharacteristic2, genericCharacteristic])

      expect(filterAndSortCharacteristics).toHaveBeenCalledWith(
        [genericCharacteristic, premisesCharacteristic2, premisesCharacteristic1, otherCharacteristic],
        'premises',
      )
    })
  })

  describe('temporaryAccommodationTableRows', () => {
    it('returns a sorted table view of the premises for Temporary Accommodation', async () => {
      const premises1 = premisesFactory.build({ addressLine1: 'XYZ', postcode: '123' })
      const premises2 = premisesFactory.build({ addressLine1: 'ABC', postcode: '123' })
      const premises3 = premisesFactory.build({ addressLine1: 'GHI', postcode: '456' })
      const premises4 = premisesFactory.build({ addressLine1: 'GHI', postcode: '123' })

      const premises = [premises1, premises2, premises3, premises4]
      premisesClient.all.mockResolvedValue(premises)

      const rows = await service.temporaryAccommodationTableRows(token)

      expect(rows).toEqual([
        [
          {
            text: 'ABC, 123',
          },
          {
            text: premises2.bedCount.toString(),
          },
          {
            text: '',
          },
          {
            text: '',
          },
          {
            html: `<a href="${paths.premises.show({
              premisesId: premises2.id,
            })}">Manage<span class="govuk-visually-hidden"> ABC, 123</span></a>`,
          },
        ],
        [
          {
            text: 'GHI, 123',
          },
          {
            text: premises4.bedCount.toString(),
          },
          {
            text: '',
          },
          {
            text: '',
          },
          {
            html: `<a href="${paths.premises.show({
              premisesId: premises4.id,
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
            text: '',
          },
          {
            text: '',
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
            text: premises1.bedCount.toString(),
          },
          {
            text: '',
          },
          {
            text: '',
          },
          {
            html: `<a href="${paths.premises.show({
              premisesId: premises1.id,
            })}">Manage<span class="govuk-visually-hidden"> XYZ, 123</span></a>`,
          },
        ],
      ])

      expect(premisesClientFactory).toHaveBeenCalledWith(token)
      expect(premisesClient.all).toHaveBeenCalled()
    })
  })

  describe('getPremisesSelectList', () => {
    it('returns the list mapped into the format required by the nunjucks macro and sorted alphabetically', async () => {
      const premisesA = premisesFactory.build({ name: 'a' })
      const premisesB = premisesFactory.build({ name: 'b' })
      const premisesC = premisesFactory.build({ name: 'c' })
      premisesClient.all.mockResolvedValue([premisesC, premisesB, premisesA])

      const result = await service.getPremisesSelectList(token)

      expect(result).toEqual([
        { text: premisesA.name, value: premisesA.id },
        { text: premisesB.name, value: premisesB.id },
        { text: premisesC.name, value: premisesC.id },
      ])

      expect(premisesClientFactory).toHaveBeenCalledWith(token)
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
      })

      premisesClient.find.mockResolvedValue(premises)

      const result = await service.getUpdatePremises(token, premises.id)
      expect(result).toEqual({
        ...premises,
        localAuthorityAreaId: 'local-authority',
        characteristicIds: ['characteristic-a', 'characteristic-b'],
      })

      expect(premisesClient.find).toHaveBeenCalledWith(premises.id)
    })
  })

  describe('getPremises', () => {
    it('returns the premises for the given premises ID', async () => {
      const premises = premisesFactory.build()
      premisesClient.find.mockResolvedValue(premises)

      const result = await service.getPremises(token, premises.id)

      expect(result).toEqual(premises)

      expect(premisesClientFactory).toHaveBeenCalledWith(token)
      expect(premisesClient.find).toHaveBeenCalledWith(premises.id)
    })
  })

  describe('getTemporayAccommodationPremisesDetails', () => {
    it('returns a Premises and a summary list for a given Premises ID', async () => {
      const premises = premisesFactory.build({
        name: 'Test',
        addressLine1: '10 Example Street',
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

      const result = await service.getTemporaryAccommodationPremisesDetails(token, premises.id)

      expect(result).toEqual({
        premises,
        summaryList: {
          rows: [
            {
              key: { text: 'Address' },
              value: { html: '10 Example Street<br />SW1A 1AA' },
            },
            {
              key: { text: 'PDU' },
              value: { text: '' },
            },
            {
              key: { text: 'Local authority' },
              value: { text: 'Test Authority' },
            },
            {
              key: { text: 'Occupancy' },
              value: { text: '' },
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

      expect(premisesClientFactory).toHaveBeenCalledWith(token)
      expect(premisesClient.find).toHaveBeenCalledWith(premises.id)

      expect(escape).toHaveBeenCalledWith('10 Example Street')
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

      const result = await service.getOvercapacityMessage(token, premisesId)

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

      const result = await service.getOvercapacityMessage(token, premisesId)

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

      const result = await service.getOvercapacityMessage(token, premisesId)

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

      const result = await service.getOvercapacityMessage(token, premisesId)

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

      const result = await service.getOvercapacityMessage(token, premisesId)

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
      const result = await service.getOvercapacityMessage(token, premisesId)

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

      const createdPremises = await service.create(token, newPremises)
      expect(createdPremises).toEqual(premises)

      expect(premisesClientFactory).toHaveBeenCalledWith(token)
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

      const updatedPremises = await service.update(token, premises.id, newPremises)
      expect(updatedPremises).toEqual(premises)

      expect(premisesClientFactory).toHaveBeenCalledWith(token)
      expect(premisesClient.update).toHaveBeenCalledWith(premises.id, newPremises)
    })
  })
})
