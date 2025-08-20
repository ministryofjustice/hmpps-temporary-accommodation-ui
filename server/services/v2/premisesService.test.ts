import { TextItem } from '@approved-premises/ui'
import { Cas3PremisesArchiveAction } from '@approved-premises/api'
import PremisesClient from '../../data/v2/premisesClient'
import { CallConfig } from '../../data/restClient'
import {
  cas3ArchivePremisesFactory,
  cas3NewPremisesFactory,
  cas3PremisesFactory,
  cas3PremisesSearchResultFactory,
  cas3PremisesSearchResultsFactory,
  cas3UpdatePremisesFactory,
  characteristicFactory,
  localAuthorityFactory,
  pduFactory,
  probationRegionFactory,
} from '../../testutils/factories'
import { statusTag } from '../../utils/premisesUtils'
import PremisesService from './premisesService'
import { ReferenceDataClient } from '../../data'
import { filterCharacteristics } from '../../utils/characteristicUtils'

jest.mock('../../data/v2/premisesClient')
jest.mock('../../data/referenceDataClient')
jest.mock('../../utils/premisesUtils')
jest.mock('../../utils/viewUtils')
jest.mock('../../utils/characteristicUtils')
jest.mock('../../utils/placeUtils')

describe('PremisesService', () => {
  const premisesClient = new PremisesClient(null) as jest.Mocked<PremisesClient>
  const referenceDataClient = new ReferenceDataClient(null) as jest.Mocked<ReferenceDataClient>
  const premisesClientFactory = jest.fn()
  const referenceDataClientFactory = jest.fn()
  const service = new PremisesService(premisesClientFactory, referenceDataClientFactory)
  const callConfig = { token: 'some-token', probationRegion: probationRegionFactory.build() } as CallConfig
  const premisesId = 'premises-id'

  beforeEach(() => {
    jest.resetAllMocks()
    premisesClientFactory.mockReturnValue(premisesClient)
    referenceDataClientFactory.mockReturnValue(referenceDataClient)
  })

  describe('createPremises', () => {
    it('on success returns the premises that has been created', async () => {
      const premises = cas3PremisesFactory.build()
      const newPremises = cas3NewPremisesFactory.build({ ...premises })
      premisesClient.create.mockResolvedValue(premises)

      const createdPremises = await service.createPremises(callConfig, newPremises)
      expect(createdPremises).toEqual(premises)

      expect(premisesClientFactory).toHaveBeenCalledWith(callConfig)
      expect(premisesClient.create).toHaveBeenCalledWith(newPremises)
    })
  })

  describe('updatePremises', () => {
    it('on success returns the premises that has been updated', async () => {
      const premises = cas3PremisesFactory.build()
      const updatedPremises = cas3UpdatePremisesFactory.build({ ...premises })
      premisesClient.update.mockResolvedValue(premises)

      const result = await service.updatePremises(callConfig, premises.id, updatedPremises)
      expect(result).toEqual(premises)

      expect(premisesClientFactory).toHaveBeenCalledWith(callConfig)
      expect(premisesClient.update).toHaveBeenCalledWith(premises.id, updatedPremises)
    })
  })

  describe('archivePremises', () => {
    it('on success returns the premises that has been archived', async () => {
      const premises = cas3PremisesFactory.build({ status: 'archived' })
      const archivePayload = cas3ArchivePremisesFactory.build()
      premisesClient.archive.mockResolvedValue(premises)

      const result = await service.archivePremises(callConfig, premises.id, archivePayload)
      expect(result).toEqual(premises)

      expect(premisesClientFactory).toHaveBeenCalledWith(callConfig)
      expect(premisesClient.archive).toHaveBeenCalledWith(premises.id, archivePayload)
    })
  })

  describe('tableRows', () => {
    const searchResult1 = cas3PremisesSearchResultFactory.build({
      addressLine1: '32 Windsor Gardens',
      town: 'London',
      postcode: 'W9 3RQ',
      pdu: 'Hammersmith, Fulham, Kensington, Chelsea and Westminster',
      bedspaces: [],
    })
    const searchResult2 = cas3PremisesSearchResultFactory.build({
      addressLine1: '221c Baker Street',
      town: 'London',
      postcode: 'NW1 6XE',
      pdu: 'Hammersmith, Fulham, Kensington, Chelsea and Westminster',
    })
    const searchResult3 = cas3PremisesSearchResultFactory.build({
      addressLine1: '62 West Wallaby Street',
      town: 'Wigan',
      postcode: 'WG7 7FU',
      pdu: 'Wigan',
    })

    it.each([
      [
        [searchResult2, searchResult1, searchResult3],
        [searchResult2, searchResult1, searchResult3],
      ],
      [
        [searchResult2, searchResult1],
        [searchResult2, searchResult1],
      ],
      [[], []],
      [undefined, []],
    ])('returns table view of the premises for Temporary Accommodation', (searchResults, expectedResults) => {
      const premises = cas3PremisesSearchResultsFactory.build({ results: searchResults })
      ;(statusTag as jest.MockedFunction<typeof statusTag>).mockImplementation(status => `<strong>${status}</strong>`)

      const rows = service.tableRows(premises)

      const expectedRows = expectedResults.map(prem => {
        const address = [prem.addressLine1, prem.addressLine2, prem.town, prem.postcode]
          .filter(s => s !== undefined && s !== '')
          .join('<br />')

        const bedspaces =
          prem.bedspaces.length === 0
            ? `No bedspaces<br /><a href="/v2/properties/${prem.id}/bedspaces/new">Add a bedspace</a>`
            : prem.bedspaces
                .map(bed => {
                  const archivedTag =
                    bed.status === 'archived' ? ` <strong class="govuk-tag govuk-tag--grey">Archived</strong>` : ''
                  return `<a href="/v2/properties/${prem.id}/bedspaces/${bed.id}">${bed.reference}</a>${archivedTag}`
                })
                .join('<br />')

        return [
          { html: address },
          { html: bedspaces },
          { text: prem.pdu },
          {
            html: `<a href="/v2/properties/${prem.id}">Manage<span class="govuk-visually-hidden"> property at ${prem.addressLine1}, ${prem.postcode}</span></a>`,
          },
        ]
      })

      expect(rows).toEqual(expectedRows)
    })

    it('returns table rows with local authority area name when premisesSortBy is "la"', () => {
      const searchResult = cas3PremisesSearchResultFactory.build({
        addressLine1: '32 Windsor Gardens',
        town: 'London',
        postcode: 'W9 3RQ',
        pdu: 'Hammersmith, Fulham, Kensington, Chelsea and Westminster',
        localAuthorityAreaName: 'Westminster',
        bedspaces: [],
      })

      const premises = cas3PremisesSearchResultsFactory.build({ results: [searchResult] })
      ;(statusTag as jest.MockedFunction<typeof statusTag>).mockImplementation(status => `<strong>${status}</strong>`)

      const rows = service.tableRows(premises, 'la')

      const address = [searchResult.addressLine1, searchResult.addressLine2, searchResult.town, searchResult.postcode]
        .filter(s => s !== undefined && s !== '')
        .join('<br />')

      const bedspaces = `No bedspaces<br /><a href="/v2/properties/${searchResult.id}/bedspaces/new">Add a bedspace</a>`

      expect(rows).toEqual([
        [
          { html: address },
          { html: bedspaces },
          { text: searchResult.localAuthorityAreaName },
          {
            html: `<a href="/v2/properties/${searchResult.id}">Manage<span class="govuk-visually-hidden"> property at ${searchResult.addressLine1}, ${searchResult.postcode}</span></a>`,
          },
        ],
      ])
    })
  })

  describe('searchDataAndGenerateTableRows', () => {
    const searchResult1 = cas3PremisesSearchResultFactory.build({
      addressLine1: '32 Windsor Gardens',
      town: 'London',
      postcode: 'W9 3RQ',
      pdu: 'Hammersmith, Fulham, Kensington, Chelsea and Westminster',
      bedspaces: [],
    })
    const searchResult2 = cas3PremisesSearchResultFactory.build({
      addressLine1: '221c Baker Street',
      town: 'London',
      postcode: 'NW1 6XE',
      pdu: 'Hammersmith, Fulham, Kensington, Chelsea and Westminster',
    })

    it('returns search results with table rows for online status by default', async () => {
      const postcodeOrAddress = 'London'
      const searchResults = cas3PremisesSearchResultsFactory.build({
        results: [searchResult1, searchResult2],
        totalPremises: 2,
        totalOnlineBedspaces: 5,
        totalUpcomingBedspaces: 0,
      })

      premisesClient.search.mockResolvedValue(searchResults)

      const result = await service.searchDataAndGenerateTableRows(callConfig, postcodeOrAddress)

      expect(result).toEqual({
        ...searchResults,
        tableRows: expect.any(Array),
      })
      expect(result.tableRows).toHaveLength(2)
      expect(premisesClientFactory).toHaveBeenCalledWith(callConfig)
      expect(premisesClient.search).toHaveBeenCalledWith('London', 'online', 'pdu')
    })

    it('returns search results with table rows for specified status', async () => {
      const postcodeOrAddress = 'London'
      const searchResults = cas3PremisesSearchResultsFactory.build({
        results: [searchResult1],
        totalPremises: 1,
        totalOnlineBedspaces: 2,
        totalUpcomingBedspaces: 0,
      })

      premisesClient.search.mockResolvedValue(searchResults)

      const result = await service.searchDataAndGenerateTableRows(callConfig, postcodeOrAddress, 'archived')

      expect(result).toEqual({
        ...searchResults,
        tableRows: expect.any(Array),
      })
      expect(result.tableRows).toHaveLength(1)
      expect(premisesClientFactory).toHaveBeenCalledWith(callConfig)
      expect(premisesClient.search).toHaveBeenCalledWith('London', 'archived', 'pdu')
    })

    it('returns empty search results when there are no properties in the database', async () => {
      const postcodeOrAddress = ''
      const searchResults = cas3PremisesSearchResultsFactory.build({
        results: [],
        totalPremises: 0,
        totalOnlineBedspaces: 0,
        totalUpcomingBedspaces: 0,
      })

      premisesClient.search.mockResolvedValue(searchResults)

      const result = await service.searchDataAndGenerateTableRows(callConfig, postcodeOrAddress)

      expect(result).toEqual({
        ...searchResults,
        tableRows: [],
      })
      expect(result.tableRows).toHaveLength(0)
      expect(result.totalPremises).toBe(0)
      expect(result.totalOnlineBedspaces).toBe(0)
      expect(premisesClientFactory).toHaveBeenCalledWith(callConfig)
      expect(premisesClient.search).toHaveBeenCalledWith('', 'online', 'pdu')
    })
  })

  describe('getSinglePremises', () => {
    it('should return the premises', async () => {
      const premises = cas3PremisesFactory.build({ id: premisesId })
      premisesClient.find.mockResolvedValue(premises)

      const result = await service.getSinglePremises(callConfig, premisesId)

      expect(result).toBe(premises)
      expect(premisesClientFactory).toHaveBeenCalledWith(callConfig)
      expect(premisesClient.find).toHaveBeenCalledWith(premisesId)
    })
  })

  describe('getSinglePremisesDetails', () => {
    it('should return the premises with full address', async () => {
      const premises = cas3PremisesFactory.build({
        id: premisesId,
        addressLine1: '32 Windsor Gardens',
        addressLine2: undefined,
        town: 'London',
        postcode: 'W9 3RQ',
      })
      premisesClient.find.mockResolvedValue(premises)

      const result = await service.getSinglePremisesDetails(callConfig, premisesId)

      expect(result).toEqual({
        ...premises,
        fullAddress: '32 Windsor Gardens<br />London<br />W9 3RQ',
      })
      expect(premisesClientFactory).toHaveBeenCalledWith(callConfig)
      expect(premisesClient.find).toHaveBeenCalledWith(premisesId)
    })
  })

  describe('summaryList', () => {
    const onlinePremises = cas3PremisesFactory.build({ status: 'online', startDate: '2025-02-01' })
    const archivedPremises = cas3PremisesFactory.build({ status: 'archived', startDate: '2025-03-02' })

    it('should return a summary list for an online premises', async () => {
      const summaryList = service.summaryList(onlinePremises)

      const expectedSummaryList = {
        rows: [
          {
            key: { text: 'Property status' },
            value: { html: `<strong class="govuk-tag govuk-tag--green">Online</strong>` },
          },
          {
            key: { text: 'Start date' },
            value: { text: '1 February 2025' },
          },
          {
            key: { text: 'Address' },
            value: {
              html: `${onlinePremises.addressLine1}<br />${onlinePremises.addressLine2}<br />${onlinePremises.town}<br />${onlinePremises.postcode}`,
            },
          },
          {
            key: { text: 'Local authority' },
            value: { text: onlinePremises.localAuthorityArea.name },
          },
          {
            key: { text: 'Probation region' },
            value: { text: onlinePremises.probationRegion.name },
          },
          {
            key: { text: 'Probation delivery unit' },
            value: { text: onlinePremises.probationDeliveryUnit.name },
          },
          {
            key: { text: 'Expected turn around time' },
            value: { text: `${onlinePremises.turnaroundWorkingDays} working days` },
          },
          {
            key: { text: 'Property details' },
            value: {
              html: onlinePremises.characteristics
                .map(char => `<span class="hmpps-tag-filters">${char.name}</span>`)
                .join(' '),
            },
          },
          {
            key: { text: 'Additional property details' },
            value: { text: onlinePremises.notes },
          },
        ],
      }

      expect(summaryList).toEqual(expectedSummaryList)
    })

    it('should return a summary list for an archived premises', async () => {
      const summaryList = service.summaryList(archivedPremises)

      const expectedSummaryList = {
        rows: [
          {
            key: { text: 'Property status' },
            value: { html: `<strong class="govuk-tag govuk-tag--grey">Archived</strong>` },
          },
          {
            key: { text: 'Start date' },
            value: { text: '2 March 2025' },
          },
          {
            key: { text: 'Address' },
            value: {
              html: `${archivedPremises.addressLine1}<br />${archivedPremises.addressLine2}<br />${archivedPremises.town}<br />${archivedPremises.postcode}`,
            },
          },
          {
            key: { text: 'Local authority' },
            value: { text: archivedPremises.localAuthorityArea.name },
          },
          {
            key: { text: 'Probation region' },
            value: { text: archivedPremises.probationRegion.name },
          },
          {
            key: { text: 'Probation delivery unit' },
            value: { text: archivedPremises.probationDeliveryUnit.name },
          },
          {
            key: { text: 'Expected turn around time' },
            value: { text: `${archivedPremises.turnaroundWorkingDays} working days` },
          },
          {
            key: { text: 'Property details' },
            value: {
              html: archivedPremises.characteristics
                .map(char => `<span class="hmpps-tag-filters">${char.name}</span>`)
                .join(' '),
            },
          },
          {
            key: { text: 'Additional property details' },
            value: { text: archivedPremises.notes },
          },
        ],
      }

      expect(summaryList).toEqual(expectedSummaryList)
    })

    it('should show "None" for additional property details when there are no notes', () => {
      const premises = cas3PremisesFactory.build({ notes: '' })
      const summaryList = service.summaryList(premises)

      const additionalPropertyDetailsRow = summaryList.rows.find(
        row => (row.key as TextItem)?.text === 'Additional property details',
      )

      expect(additionalPropertyDetailsRow.value).toEqual({ text: 'None' })
    })

    it('should show "None" and "Add property details" link for property details when there are none', () => {
      const premises = cas3PremisesFactory.build({ characteristics: [] })
      const summaryList = service.summaryList(premises)

      const propertyDetailsRow = summaryList.rows.find(row => (row.key as TextItem)?.text === 'Property details')

      const expectedHtml = `<p>None</p><p><a href="#">Add property details</a></p>`
      expect(propertyDetailsRow.value).toEqual({ html: expectedHtml })
    })

    it('includes scheduled archive date in the status row for online premises with endDate (scheduled archive)', () => {
      const premises = cas3PremisesFactory.build({
        status: 'online',
        endDate: '2125-08-20',
      })

      const summary = service.summaryList(premises)
      const statusRowValue = (summary.rows[0].value as { html: string }).html

      expect(statusRowValue).toContain('<strong class="govuk-tag govuk-tag--green">Online</strong>')
      expect(statusRowValue).toContain('Scheduled archive date 20 August 2125')
    })

    it('includes scheduled online date in the status row for archived premises with future startDate (scheduled online)', () => {
      const premises = cas3PremisesFactory.build({
        status: 'archived',
        startDate: '2125-08-20',
      })

      const summary = service.summaryList(premises)
      const statusRowValue = (summary.rows[0].value as { html: string }).html

      expect(statusRowValue).toContain('<strong class="govuk-tag govuk-tag--grey">Archived</strong>')
      expect(statusRowValue).toContain('Scheduled online date 20 August 2125')
    })

    it('should show archive history as a details section when there are 14 or more actions', () => {
      const archiveHistory = Array.from(
        { length: 14 },
        (_, i) =>
          ({
            date: `2025-01-01`,
            status: i % 2 === 0 ? 'online' : 'archived',
          }) as Cas3PremisesArchiveAction,
      )
      const premises = cas3PremisesFactory.build({ archiveHistory })

      const summary = service.summaryList(premises)
      const archiveRow = summary.rows.find(row => (row.key as { text: string }).text === 'Archive history')

      if ('html' in archiveRow.value) {
        expect(archiveRow.value.html).toContain('<details class="govuk-details">')
        expect(archiveRow.value.html).toContain('Full history')
        expect(archiveRow.value.html).toContain('Online date')
        expect(archiveRow.value.html).toContain('Archived date')
      } else {
        throw new Error('No html property found in archiveRow.value')
      }
    })

    it('should show archiveHistory as a list when there are fewer than 14 actions', () => {
      const archiveHistory = Array.from(
        { length: 3 },
        (_, i) =>
          ({
            date: `2025-01-01`,
            status: i % 2 === 0 ? 'online' : 'archived',
          }) as Cas3PremisesArchiveAction,
      )
      const premises = cas3PremisesFactory.build({ archiveHistory })

      const summary = service.summaryList(premises)
      const archiveRow = summary.rows.find(row => (row.key as { text: string }).text === 'Archive history')
      if ('html' in archiveRow.value) {
        expect(archiveRow.value.html).not.toContain('<details class="govuk-details">')
        expect(archiveRow.value.html).not.toContain('Full history')
        expect(archiveRow.value.html).toContain('Online date')
        expect(archiveRow.value.html).toContain('Archived date')
      } else {
        throw new Error('No html property found in archiveRow.value')
      }
    })
  })

  describe('shortSummaryList', () => {
    const onlinePremises = cas3PremisesFactory.build({ status: 'online', startDate: '2025-04-05' })
    const archivedPremises = cas3PremisesFactory.build({ status: 'archived', startDate: '2025-05-06' })

    it('should return a short summary list for an online premises', () => {
      const summaryList = service.shortSummaryList(onlinePremises)

      expect(summaryList).toEqual({
        rows: [
          {
            key: { text: 'Status' },
            value: { html: '<strong class="govuk-tag govuk-tag--green">Online</strong>' },
          },
          {
            key: { text: 'Address' },
            value: {
              html: `${onlinePremises.addressLine1}<br />${onlinePremises.addressLine2}<br />${onlinePremises.town}<br />${onlinePremises.postcode}`,
            },
          },
        ],
      })
    })

    it('should return a short summary list for an archived premises', () => {
      const summaryList = service.shortSummaryList(archivedPremises)

      expect(summaryList).toEqual({
        rows: [
          {
            key: { text: 'Status' },
            value: { html: '<strong class="govuk-tag govuk-tag--grey">Archived</strong>' },
          },
          {
            key: { text: 'Address' },
            value: {
              html: `${archivedPremises.addressLine1}<br />${archivedPremises.addressLine2}<br />${archivedPremises.town}<br />${archivedPremises.postcode}`,
            },
          },
        ],
      })
    })
  })

  describe('getReferenceData', () => {
    const localAuthority1 = localAuthorityFactory.build({ name: 'Newcastle' })
    const localAuthority2 = localAuthorityFactory.build({ name: 'Gateshead' })
    const localAuthority3 = localAuthorityFactory.build({ name: 'Sunderland' })
    const unsortedLocalAuthorities = [localAuthority1, localAuthority2, localAuthority3]

    const characteristic1 = characteristicFactory.build({ name: 'Rural property', modelScope: 'premises' })
    const characteristic2 = characteristicFactory.build({ name: 'Ground floor accessible', modelScope: 'premises' })
    const characteristic3 = characteristicFactory.build({ name: 'Pub nearby', modelScope: 'premises' })
    const characteristic4 = characteristicFactory.build({ name: 'Sea view', modelScope: 'room' })
    const unsortedCharacteristics = [characteristic1, characteristic2, characteristic3, characteristic4]

    const unsortedProbationRegions = [callConfig.probationRegion]

    const pdu1 = pduFactory.build({ name: 'Newcastle upon Tyne' })
    const pdu2 = pduFactory.build({ name: 'North Tyneside and Northumberland' })
    const pdu3 = pduFactory.build({ name: 'Gateshead and South Tyneside' })
    const unsortedPdus = [pdu1, pdu2, pdu3]

    it('returns sorted reference data', async () => {
      referenceDataClient.getReferenceData.mockImplementation(async (objectType: string) => {
        if (objectType === 'local-authority-areas') {
          return unsortedLocalAuthorities
        }
        if (objectType === 'characteristics') {
          return unsortedCharacteristics
        }
        if (objectType === 'probation-regions') {
          return unsortedProbationRegions
        }
        return unsortedPdus
      })
      ;(filterCharacteristics as jest.MockedFunction<typeof filterCharacteristics>).mockReturnValue([
        characteristic2,
        characteristic3,
        characteristic1,
      ])

      const result = await service.getReferenceData(callConfig)

      expect(result).toEqual({
        localAuthorities: [localAuthority2, localAuthority1, localAuthority3],
        characteristics: [characteristic2, characteristic3, characteristic1],
        probationRegions: [callConfig.probationRegion],
        pdus: [pdu3, pdu1, pdu2],
      })

      expect(referenceDataClientFactory).toHaveBeenCalledWith(callConfig)
      expect(referenceDataClient.getReferenceData).toHaveBeenCalledWith('local-authority-areas')
      expect(referenceDataClient.getReferenceData).toHaveBeenCalledWith('characteristics')
      expect(referenceDataClient.getReferenceData).toHaveBeenCalledWith('probation-regions')
      expect(referenceDataClient.getReferenceData).toHaveBeenCalledWith('probation-delivery-units', {
        probationRegionId: callConfig.probationRegion.id,
      })

      expect(filterCharacteristics).toHaveBeenCalledWith(
        [characteristic1, characteristic2, characteristic3, characteristic4],
        'premises',
      )
    })
  })
})
