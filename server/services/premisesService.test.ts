import { PremisesSearchParameters } from '@approved-premises/ui'
import PremisesClient from '../data/premisesClient'
import ReferenceDataClient from '../data/referenceDataClient'
import { CallConfig } from '../data/restClient'
import paths from '../paths/temporary-accommodation/manage'
import {
  cas3PremisesSummaryFactory,
  characteristicFactory,
  localAuthorityFactory,
  newPremisesFactory,
  pduFactory,
  placeContextFactory,
  premisesFactory,
  probationRegionFactory,
  staffMemberFactory,
  updatePremisesFactory,
} from '../testutils/factories'
import { filterCharacteristics, formatCharacteristics } from '../utils/characteristicUtils'
import { addPlaceContext } from '../utils/placeUtils'
import { statusTag } from '../utils/premisesUtils'
import { escape, formatLines } from '../utils/viewUtils'
import PremisesService from './premisesService'

jest.mock('../data/premisesClient')
jest.mock('../data/referenceDataClient')
jest.mock('../utils/premisesUtils')
jest.mock('../utils/viewUtils')
jest.mock('../utils/characteristicUtils')
jest.mock('../utils/placeUtils')

describe('PremisesService', () => {
  const premisesClient = new PremisesClient(null) as jest.Mocked<PremisesClient>
  const referenceDataClient = new ReferenceDataClient(null) as jest.Mocked<ReferenceDataClient>

  const premisesClientFactory = jest.fn()
  const referenceDataClientFactory = jest.fn()

  const service = new PremisesService(premisesClientFactory, referenceDataClientFactory)

  const callConfig = { token: 'some-token', probationRegion: probationRegionFactory.build() } as CallConfig
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
      const roomCharacteristic = characteristicFactory.build({ name: 'LMN', modelScope: 'room' })

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
          return [genericCharacteristic, premisesCharacteristic2, premisesCharacteristic1, roomCharacteristic]
        }
        if (objectType === 'probation-regions') {
          return [probationRegion2, probationRegion1, probationRegion3]
        }
        return [pdu2, pdu3, pdu1]
      })
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
      expect(referenceDataClient.getReferenceData).toHaveBeenCalledWith('probation-delivery-units', {
        probationRegionId: callConfig.probationRegion.id,
      })

      expect(filterCharacteristics).toHaveBeenCalledWith(
        [genericCharacteristic, premisesCharacteristic2, premisesCharacteristic1, roomCharacteristic],
        'premises',
      )
    })
  })

  describe('tableRows', () => {
    const premisesSummary1 = cas3PremisesSummaryFactory.build({ addressLine1: 'ABC', postcode: '123', pdu: 'Hampshire South and Isle of Wight' })
    const premisesSummary2 = cas3PremisesSummaryFactory.build({ addressLine1: 'GHI', postcode: '123', pdu: 'Hampshire South and Isle of Wight' })
    const premisesSummary3 = cas3PremisesSummaryFactory.build({ addressLine1: 'GHI', postcode: '456', pdu: 'Bedfordshire' })
    const premisesSummary4 = cas3PremisesSummaryFactory.build({ addressLine1: 'XYZ', postcode: '123', pdu: 'Bedfordshire' })

    it.each([
      [
        [premisesSummary4, premisesSummary1, premisesSummary3, premisesSummary2],
        undefined,
        [premisesSummary3, premisesSummary4, premisesSummary1, premisesSummary2],
      ],
      [[premisesSummary2, premisesSummary3], 'GHI', [premisesSummary3, premisesSummary2]],
      [[], 'ABC', []],
    ])(
      'returns a sorted table view of the premises for Temporary Accommodation with an option search for an address',
      async (premises, postcodeOrAddress, expectedPremises) => {
        const placeContext = placeContextFactory.build()
        const params: PremisesSearchParameters = { postcodeOrAddress }

        const clientFunction = postcodeOrAddress ? premisesClient.search : premisesClient.all

        clientFunction.mockResolvedValue(premises)
        ;(statusTag as jest.MockedFunction<typeof statusTag>).mockImplementation(status => `<strong>${status}</strong>`)
        ;(addPlaceContext as jest.MockedFunction<typeof addPlaceContext>).mockReturnValue('/path/with/place/context')

        const rows = await service.tableRows(callConfig, placeContext, params)

        const expectedRows = expectedPremises.map(prem => {
          const shortAddress = `${prem.addressLine1}, ${prem.postcode}`
          return [
            { text: shortAddress },
            { text: prem.bedspaceCount.toString() },
            { text: prem.pdu },
            { html: `<strong>${prem.status}</strong>` },
            {
              html: `<a href="/path/with/place/context">Manage<span class="govuk-visually-hidden"> ${shortAddress}</span></a>`,
            },
          ]
        })

        expect(rows).toEqual(expectedRows)

        expect(premisesClientFactory).toHaveBeenCalledWith(callConfig)
        expect(clientFunction).toHaveBeenCalled()
        expectedPremises.forEach(prem => {
          expect(addPlaceContext).toHaveBeenCalledWith(paths.premises.show({ premisesId: prem.id }), placeContext)
        })
      },
    )
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
        probationDeliveryUnit: pduFactory.build({
          name: 'A probation delivery unit',
          id: 'a-probation-delivery-unit',
        }),
      })

      premisesClient.find.mockResolvedValue(premises)

      const result = await service.getUpdatePremises(callConfig, premises.id)
      expect(result).toEqual({
        ...premises,
        localAuthorityAreaId: 'local-authority',
        characteristicIds: ['characteristic-a', 'characteristic-b'],
        probationRegionId: 'a-probation-region',
        probationDeliveryUnitId: 'a-probation-delivery-unit',
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
        probationDeliveryUnit: pduFactory.build({ name: 'A PDU' }),
        status: 'active',
        notes: 'Some notes',
        turnaroundWorkingDayCount: 2,
      })

      premisesClient.find.mockResolvedValue(premises)
      ;(escape as jest.MockedFunction<typeof escape>).mockImplementation(text => text)
      ;(formatLines as jest.MockedFunction<typeof escape>).mockImplementation(text => text)
      ;(formatCharacteristics as jest.MockedFunction<typeof formatCharacteristics>).mockImplementation(() => ({
        text: 'Some attributes',
      }))
      ;(statusTag as jest.MockedFn<typeof statusTag>).mockReturnValue('<strong>Online</strong>')

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
              value: { html: '<strong>Online</strong>' },
            },
            {
              key: { text: 'Notes' },
              value: { html: 'Some notes' },
            },
            {
              key: { text: 'Expected turnaround time' },
              value: { text: '2 working days' },
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
      expect(statusTag).toHaveBeenCalledWith('active')
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
      const updatePremises = updatePremisesFactory.build({
        postcode: premises.postcode,
        notes: premises.notes,
      })
      premisesClient.update.mockResolvedValue(premises)

      const updatedPremises = await service.update(callConfig, premises.id, updatePremises)
      expect(updatedPremises).toEqual(premises)

      expect(premisesClientFactory).toHaveBeenCalledWith(callConfig)
      expect(premisesClient.update).toHaveBeenCalledWith(premises.id, {
        ...updatePremises,
      })
    })
  })
})
