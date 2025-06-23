import BedspaceClient from '../../data/v2/bedspaceClient'
import BedspaceService from './bedspaceService'
import { cas3BedspaceFactory, probationRegionFactory } from '../../testutils/factories'
import { CallConfig } from '../../data/restClient'

jest.mock('../../data/v2/bedspaceClient')

describe('BedspaceService', () => {
  const bedspaceClient = new BedspaceClient(null) as jest.Mocked<BedspaceClient>
  const bedspaceClientFactory = jest.fn()
  const service = new BedspaceService(bedspaceClientFactory)
  const callConfig = { token: 'some-token', probationRegion: probationRegionFactory.build() } as CallConfig

  beforeEach(() => {
    jest.resetAllMocks()
    bedspaceClientFactory.mockReturnValue(bedspaceClient)
  })

  describe('getSingleBedspaceDetails', () => {
    const premisesId = 'some-premises-id'

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
})
