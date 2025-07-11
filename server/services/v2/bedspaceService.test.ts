import BedspaceClient from '../../data/v2/bedspaceClient'
import ReferenceDataClient from '../../data/referenceDataClient'
import BedspaceService from './bedspaceService'
import {
  cas3BedspaceFactory,
  cas3BedspacesFactory,
  cas3NewBedspaceFactory,
  characteristicFactory,
  probationRegionFactory,
} from '../../testutils/factories'
import { filterCharacteristics } from '../../utils/characteristicUtils'
import { CallConfig } from '../../data/restClient'

jest.mock('../../data/v2/bedspaceClient')
jest.mock('../../data/referenceDataClient')
jest.mock('../../utils/characteristicUtils')

describe('BedspaceService', () => {
  const bedspaceClient = new BedspaceClient(null) as jest.Mocked<BedspaceClient>
  const referenceDataClient = new ReferenceDataClient(null) as jest.Mocked<ReferenceDataClient>
  const bedspaceClientFactory = jest.fn()
  const referenceDataClientFactory = jest.fn()

  const service = new BedspaceService(bedspaceClientFactory, referenceDataClientFactory)
  const callConfig = { token: 'some-token', probationRegion: probationRegionFactory.build() } as CallConfig

  const premisesId = 'some-premises-id'

  beforeEach(() => {
    jest.resetAllMocks()
    bedspaceClientFactory.mockReturnValue(bedspaceClient)
    referenceDataClientFactory.mockReturnValue(referenceDataClient)
  })

  describe('getSingleBedspaceDetails', () => {
    it.each([
      [
        cas3BedspaceFactory.build({ status: 'online', startDate: '2025-01-02T03:04:05.678912Z' }),
        'Online',
        'green',
        '2 January 2025',
      ],
      [
        cas3BedspaceFactory.build({ status: 'archived', startDate: '2025-02-03T04:05:06.789123Z' }),
        'Archived',
        'grey',
        '3 February 2025',
      ],
      [
        cas3BedspaceFactory.build({ status: 'upcoming', startDate: '2125-03-04T05:06:07.891234Z' }),
        'Upcoming',
        'blue',
        '4 March 2125',
      ],
      [cas3BedspaceFactory.build({ status: 'online', startDate: '' }), 'Online', 'green', ''],
      [
        cas3BedspaceFactory.build({ status: null, startDate: '2025-04-05T06:07:08.912345Z' }),
        '',
        'grey',
        '5 April 2025',
      ],
    ])('returns the details for a single bedspace', async (bedspace, status, tagColour, formattedDate) => {
      const bedspaceId = bedspace.id

      bedspaceClient.find.mockResolvedValue(bedspace)

      const expectedSummary = {
        rows: [
          {
            key: { text: 'Bedspace status' },
            value: { html: `<strong class="govuk-tag govuk-tag--${tagColour}">${status}</strong>` },
          },
          {
            key: { text: 'Start date' },
            value: { text: formattedDate },
          },
          {
            key: { text: 'Bedspace details' },
            value: {
              html: bedspace.characteristics
                .map(characteristic => `<span class="hmpps-tag-filters">${characteristic.name}</span>`)
                .join(' '),
            },
          },
          {
            key: { text: 'Additional bedspace details' },
            value: { text: bedspace.notes },
          },
        ],
      }

      const result = await service.getSingleBedspaceDetails(callConfig, premisesId, bedspaceId)

      expect(result).toEqual({
        ...bedspace,
        summary: expectedSummary,
      })

      expect(bedspaceClientFactory).toHaveBeenCalledWith(callConfig)
      expect(bedspaceClient.find).toHaveBeenCalled()
    })
  })

  describe('createBedspace', () => {
    it('on success returns the bedspace that has been created', async () => {
      const bedspace = cas3BedspaceFactory.build()
      const newBedspace = cas3NewBedspaceFactory.build({
        ...bedspace,
      })
      bedspaceClient.create.mockResolvedValue(bedspace)

      const postedBedspace = await service.createBedspace(callConfig, premisesId, newBedspace)
      expect(postedBedspace).toEqual(bedspace)

      expect(bedspaceClientFactory).toHaveBeenCalledWith(callConfig)
      expect(bedspaceClient.create).toHaveBeenCalledWith(premisesId, newBedspace)
    })
  })

  describe('getReferenceData', () => {
    it('returns sorted bedspace characteristics', async () => {
      const bedspaceCharacteristic1 = characteristicFactory.build({ name: 'ABC', modelScope: 'room' })
      const bedspaceCharacteristic2 = characteristicFactory.build({ name: 'EFG', modelScope: 'room' })
      const genericCharacteristic = characteristicFactory.build({ name: 'HIJ', modelScope: '*' })
      const premisesCharacteristic = characteristicFactory.build({ name: 'LMN', modelScope: 'premises' })

      referenceDataClient.getReferenceData.mockResolvedValue([
        genericCharacteristic,
        bedspaceCharacteristic2,
        bedspaceCharacteristic1,
        premisesCharacteristic,
      ])
      ;(filterCharacteristics as jest.MockedFunction<typeof filterCharacteristics>).mockReturnValue([
        bedspaceCharacteristic2,
        genericCharacteristic,
        bedspaceCharacteristic1,
      ])

      const result = await service.getReferenceData(callConfig)
      expect(result).toEqual({
        characteristics: [bedspaceCharacteristic1, bedspaceCharacteristic2, genericCharacteristic],
      })

      expect(filterCharacteristics).toHaveBeenCalledWith(
        [genericCharacteristic, bedspaceCharacteristic2, bedspaceCharacteristic1, premisesCharacteristic],
        'room',
      )
    })
  })

  describe('get bedspaces for premises', () => {
    it('returns bedspaces for a premises', async () => {
      const bedspaces = cas3BedspacesFactory.build()

      bedspaceClient.get.mockResolvedValue(bedspaces)

      const result = await service.getBedspacesForPremises(callConfig, premisesId)

      expect(bedspaces).toEqual(result)
      expect(bedspaceClientFactory).toHaveBeenCalledWith(callConfig)
      expect(bedspaceClient.get).toHaveBeenCalledWith(premisesId)
    })
  })

  describe('get summaryList from bedspace', () => {
    it('returns a summaryList for an online bedspace', () => {
      const bedspace = cas3BedspaceFactory.build({ status: 'online', startDate: '2025-05-17' })

      const expectedSummary = {
        rows: [
          {
            key: { text: 'Bedspace status' },
            value: { html: '<strong class="govuk-tag govuk-tag--green">Online</strong>' },
          },
          {
            key: { text: 'Start date' },
            value: { text: '17 May 2025' },
          },
          {
            key: { text: 'Bedspace details' },
            value: {
              html: bedspace.characteristics
                .map(characteristic => `<span class="hmpps-tag-filters">${characteristic.name}</span>`)
                .join(' '),
            },
          },
          {
            key: { text: 'Additional bedspace details' },
            value: { text: bedspace.notes },
          },
        ],
      }

      const summary = service.summaryList(bedspace)

      expect(summary).toEqual(expectedSummary)
    })

    it('returns a summaryList for an archived bedspace', () => {
      const bedspace = cas3BedspaceFactory.build({ status: 'archived', startDate: '2025-06-18' })

      const expectedSummary = {
        rows: [
          {
            key: { text: 'Bedspace status' },
            value: { html: '<strong class="govuk-tag govuk-tag--grey">Archived</strong>' },
          },
          {
            key: { text: 'Start date' },
            value: { text: '18 June 2025' },
          },
          {
            key: { text: 'Bedspace details' },
            value: {
              html: bedspace.characteristics
                .map(characteristic => `<span class="hmpps-tag-filters">${characteristic.name}</span>`)
                .join(' '),
            },
          },
          {
            key: { text: 'Additional bedspace details' },
            value: { text: bedspace.notes },
          },
        ],
      }

      const summary = service.summaryList(bedspace)

      expect(summary).toEqual(expectedSummary)
    })

    it('returns a summaryList for an upcoming bedspace', () => {
      const bedspace = cas3BedspaceFactory.build({ status: 'upcoming', startDate: '2125-07-19' })

      const expectedSummary = {
        rows: [
          {
            key: { text: 'Bedspace status' },
            value: { html: '<strong class="govuk-tag govuk-tag--blue">Upcoming</strong>' },
          },
          {
            key: { text: 'Start date' },
            value: { text: '19 July 2125' },
          },
          {
            key: { text: 'Bedspace details' },
            value: {
              html: bedspace.characteristics
                .map(characteristic => `<span class="hmpps-tag-filters">${characteristic.name}</span>`)
                .join(' '),
            },
          },
          {
            key: { text: 'Additional bedspace details' },
            value: { text: bedspace.notes },
          },
        ],
      }

      const summary = service.summaryList(bedspace)

      expect(summary).toEqual(expectedSummary)
    })
  })
})
