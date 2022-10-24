import PremisesService from './premisesService'
import PremisesClient from '../data/premisesClient'
import premisesFactory from '../testutils/factories/premises'
import localAuthorityFactory from '../testutils/factories/localAuthority'
import dateCapacityFactory from '../testutils/factories/dateCapacity'
import staffMemberFactory from '../testutils/factories/staffMember'
import newPremisesFactory from '../testutils/factories/newPremises'
import getDateRangesWithNegativeBeds from '../utils/premisesUtils'
import apPaths from '../paths/manage'
import taPaths from '../paths/temporary-accommodation/manage'
import { escape, formatLines } from '../utils/viewUtils'

jest.mock('../data/premisesClient')
jest.mock('../utils/premisesUtils')
jest.mock('../utils/viewUtils')

describe('PremisesService', () => {
  const premisesClient = new PremisesClient(null) as jest.Mocked<PremisesClient>
  const premisesClientFactory = jest.fn()

  const service = new PremisesService(premisesClientFactory)

  const token = 'SOME_TOKEN'
  const premisesId = 'premisesId'

  beforeEach(() => {
    jest.resetAllMocks()
    premisesClientFactory.mockReturnValue(premisesClient)
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

  describe('approvedPremisesTableRows', () => {
    it('returns a sorted table view of the premises for Approved Premises', async () => {
      const premises1 = premisesFactory.build({ name: 'XYZ' })
      const premises2 = premisesFactory.build({ name: 'ABC' })
      const premises3 = premisesFactory.build({ name: 'GHI' })

      const premises = [premises1, premises2, premises3]
      premisesClient.all.mockResolvedValue(premises)

      const rows = await service.approvedPremisesTableRows(token)

      expect(rows).toEqual([
        [
          {
            text: premises2.name,
          },
          {
            text: premises2.apCode,
          },
          {
            text: premises2.bedCount.toString(),
          },
          {
            html: `<a href="${apPaths.premises.show({
              premisesId: premises2.id,
            })}">View<span class="govuk-visually-hidden">about ${premises2.name}</span></a>`,
          },
        ],
        [
          {
            text: premises3.name,
          },
          {
            text: premises3.apCode,
          },
          {
            text: premises3.bedCount.toString(),
          },
          {
            html: `<a href="${apPaths.premises.show({
              premisesId: premises3.id,
            })}">View<span class="govuk-visually-hidden">about ${premises3.name}</span></a>`,
          },
        ],
        [
          {
            text: premises1.name,
          },
          {
            text: premises1.apCode,
          },
          {
            text: premises1.bedCount.toString(),
          },
          {
            html: `<a href="${apPaths.premises.show({
              premisesId: premises1.id,
            })}">View<span class="govuk-visually-hidden">about ${premises1.name}</span></a>`,
          },
        ],
      ])

      expect(premisesClientFactory).toHaveBeenCalledWith(token)
      expect(premisesClient.all).toHaveBeenCalledWith('approved-premises')
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
            html: `<a href="${taPaths.premises.show({
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
            html: `<a href="${taPaths.premises.show({
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
            html: `<a href="${taPaths.premises.show({
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
            html: `<a href="${taPaths.premises.show({
              premisesId: premises1.id,
            })}">Manage<span class="govuk-visually-hidden"> XYZ, 123</span></a>`,
          },
        ],
      ])

      expect(premisesClientFactory).toHaveBeenCalledWith(token)
      expect(premisesClient.all).toHaveBeenCalledWith('temporary-accommodation')
    })
  })

  describe('premisesSelectList', () => {
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

  describe('getApprovedPremisesPremisesDetails', () => {
    it('returns a title and a summary list for a given Premises ID', async () => {
      const premises = premisesFactory.build({
        name: 'Test',
        apCode: 'ABC',
        postcode: 'SW1A 1AA',
        bedCount: 50,
        availableBedsForToday: 20,
      })
      premisesClient.find.mockResolvedValue(premises)

      const result = await service.getApprovedPremisesPremisesDetails(token, premises.id)

      expect(result).toEqual({
        name: 'Test',
        summaryList: {
          rows: [
            {
              key: { text: 'Code' },
              value: { text: 'ABC' },
            },
            {
              key: { text: 'Postcode' },
              value: { text: 'SW1A 1AA' },
            },
            {
              key: { text: 'Number of Beds' },
              value: { text: '50' },
            },
            {
              key: { text: 'Available Beds' },
              value: { text: '20' },
            },
          ],
        },
      })

      expect(premisesClient.find).toHaveBeenCalledWith(premises.id)

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
        notes: 'Some notes',
      })

      premisesClient.find.mockResolvedValue(premises)
      ;(escape as jest.MockedFunction<typeof escape>).mockImplementation(text => text)
      ;(formatLines as jest.MockedFunction<typeof escape>).mockImplementation(text => text)

      const result = await service.getTemporaryAccommodationPremisesDetails(token, premises.id)

      expect(result).toEqual({
        premises,
        summaryList: {
          rows: [
            {
              key: { text: 'Property name' },
              value: { text: 'Test' },
            },
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
              value: { text: '' },
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
        '<h4 class="govuk-!-margin-top-0 govuk-!-margin-bottom-2">The premises is over capacity on Saturday 1 January 2022</h4>',
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
        '<h4 class="govuk-!-margin-top-0 govuk-!-margin-bottom-2">The premises is over capacity for the period Saturday 1 January 2022 to Tuesday 1 February 2022</h4>',
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
        <ul class="govuk-list govuk-list--bullet"><li>Sunday 1 January 2023 to Wednesday 1 February 2023</li><li>Thursday 2 March 2023 to Sunday 2 April 2023</li></ul>`,
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
        <ul class="govuk-list govuk-list--bullet"><li>Sunday 1 January 2023</li><li>Thursday 2 March 2023 to Sunday 2 April 2023</li></ul>`,
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

      const postedPremises = await service.create(token, newPremises)
      expect(postedPremises).toEqual(premises)

      expect(premisesClientFactory).toHaveBeenCalledWith(token)
      expect(premisesClient.create).toHaveBeenCalledWith(newPremises)
    })
  })
})
