import { TextItem } from '@approved-premises/ui'
import { Cas3PremisesArchiveAction } from '@approved-premises/api'
import {
  assessmentFactory,
  cas3PremisesBedspaceTotalsFactory,
  cas3PremisesFactory,
  cas3PremisesSearchResultFactory,
  cas3PremisesSearchResultsFactory,
  placeContextFactory,
} from '../testutils/factories'
import {
  isPremiseScheduledToBeArchived,
  premisesActions,
  shortAddress,
  shortSummaryList,
  showPropertySubNavArray,
  summaryList,
  tableRows,
} from './premisesUtils'
import paths from '../paths/temporary-accommodation/manage'
import config from '../config'

describe('premisesUtils', () => {
  const configOriginalFlags = config.flags

  afterEach(() => {
    config.flags = configOriginalFlags
  })

  const placeContext = placeContextFactory.build({
    assessment: assessmentFactory.build({
      accommodationRequiredFromDate: '2025-08-27',
    }),
  })

  describe('shortAddress', () => {
    it('returns a shortened address for the premises when it does not have a town', () => {
      const premises = cas3PremisesFactory.build({
        addressLine1: '123 Road Lane',
        postcode: 'ABC 123',
      })
      premises.town = undefined

      expect(shortAddress(premises)).toEqual('123 Road Lane, ABC 123')
    })

    it('returns a shortened address for the premises when it does have a town', () => {
      const premises = cas3PremisesFactory.build({
        addressLine1: '123 Road Lane',
        town: 'Townville',
        postcode: 'ABC 123',
      })

      expect(shortAddress(premises)).toEqual('123 Road Lane, Townville, ABC 123')
    })
  })

  describe('showPropertySubNavArray', () => {
    it('returns the sub nav array for the premises tab', () => {
      const expectedResult = [
        {
          text: 'Property overview',
          href: `/properties/83b4062f-963e-450d-b912-589eab7ca91c?placeContextAssessmentId=${placeContext.assessment.id}&placeContextArrivalDate=${placeContext.arrivalDate}`,
          active: true,
        },
        {
          text: 'Bedspaces overview',
          href: `/properties/83b4062f-963e-450d-b912-589eab7ca91c/bedspaces?placeContextAssessmentId=${placeContext.assessment.id}&placeContextArrivalDate=${placeContext.arrivalDate}`,
          active: false,
        },
      ]

      const result = showPropertySubNavArray('83b4062f-963e-450d-b912-589eab7ca91c', placeContext, 'premises')

      expect(result).toEqual(expectedResult)
    })

    it('returns the sub nav array for the bedspaces tab', () => {
      const expectedResult = [
        {
          text: 'Property overview',
          href: `/properties/6a2fc984-8cdd-4eef-8736-cc74f845ee47?placeContextAssessmentId=${placeContext.assessment.id}&placeContextArrivalDate=${placeContext.arrivalDate}`,
          active: false,
        },
        {
          text: 'Bedspaces overview',
          href: `/properties/6a2fc984-8cdd-4eef-8736-cc74f845ee47/bedspaces?placeContextAssessmentId=${placeContext.assessment.id}&placeContextArrivalDate=${placeContext.arrivalDate}`,
          active: true,
        },
      ]

      const result = showPropertySubNavArray('6a2fc984-8cdd-4eef-8736-cc74f845ee47', placeContext, 'bedspaces')

      expect(result).toEqual(expectedResult)
    })
  })

  describe('premisesActions', () => {
    beforeEach(() => {
      config.flags.cancelScheduledArchiveEnabled = true
    })

    it('returns actions for an online premises without scheduled archive', () => {
      const premises = cas3PremisesFactory.build({ status: 'online', endDate: null })
      const actions = premisesActions(premises)

      expect(actions).toEqual([
        {
          text: 'Add a bedspace',
          classes: 'govuk-button--secondary',
          href: paths.premises.bedspaces.new({ premisesId: premises.id }),
        },
        {
          text: 'Archive property',
          classes: 'govuk-button--secondary',
          href: paths.premises.archive({ premisesId: premises.id }),
        },
        {
          text: 'Edit property details',
          classes: 'govuk-button--secondary',
          href: paths.premises.edit({ premisesId: premises.id }),
        },
      ])
    })

    it('returns actions for an online premises with scheduled archive', () => {
      const premises = cas3PremisesFactory.build({ status: 'online', endDate: '2025-12-31' })
      const actions = premisesActions(premises)

      expect(actions).toEqual([
        {
          text: 'Add a bedspace',
          classes: 'govuk-button--secondary',
          href: paths.premises.bedspaces.new({ premisesId: premises.id }),
        },
        {
          text: 'Cancel scheduled property archive',
          classes: 'govuk-button--secondary',
          href: paths.premises.cancelArchive({ premisesId: premises.id }),
        },
        {
          text: 'Edit property details',
          classes: 'govuk-button--secondary',
          href: paths.premises.edit({ premisesId: premises.id }),
        },
      ])
    })

    it('returns actions for an archived premises with scheduled unarchive', () => {
      const premises = cas3PremisesFactory.build({ status: 'archived', scheduleUnarchiveDate: '2025-12-31' })
      const actions = premisesActions(premises)

      expect(actions).toEqual([
        {
          text: 'Cancel scheduled property online date',
          classes: 'govuk-button--secondary',
          href: paths.premises.cancelUnarchive({ premisesId: premises.id }),
        },
        {
          text: 'Edit property details',
          classes: 'govuk-button--secondary',
          href: paths.premises.edit({ premisesId: premises.id }),
        },
      ])
    })

    it('returns actions for an archived premises', () => {
      const premises = cas3PremisesFactory.build({ status: 'archived', scheduleUnarchiveDate: null })
      const actions = premisesActions(premises)

      expect(actions).toEqual([
        {
          text: 'Edit property details',
          classes: 'govuk-button--secondary',
          href: paths.premises.edit({ premisesId: premises.id }),
        },
        {
          text: 'Make property online',
          classes: 'govuk-button--secondary',
          href: paths.premises.unarchive({ premisesId: premises.id }),
        },
      ])
    })
  })

  describe('isPremiseScheduledToBeArchived', () => {
    it('returns false when premisesEndDate is null', () => {
      const totals = cas3PremisesBedspaceTotalsFactory.build({ premisesEndDate: null })

      expect(isPremiseScheduledToBeArchived(totals)).toBe(false)
    })

    it('returns false when premisesEndDate is undefined', () => {
      const totals = cas3PremisesBedspaceTotalsFactory.build()
      totals.premisesEndDate = undefined

      expect(isPremiseScheduledToBeArchived(totals)).toBe(false)
    })

    it('returns false when premisesEndDate is in the past', () => {
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 1)
      const totals = cas3PremisesBedspaceTotalsFactory.build({
        premisesEndDate: pastDate.toISOString(),
        status: 'online',
      })

      expect(isPremiseScheduledToBeArchived(totals)).toBe(false)
    })

    it('returns false when premises is already archived', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 1)
      const totals = cas3PremisesBedspaceTotalsFactory.build({
        premisesEndDate: futureDate.toISOString(),
        status: 'archived',
      })

      expect(isPremiseScheduledToBeArchived(totals)).toBe(false)
    })

    it('returns true when premisesEndDate is in the future and status is online', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 1)
      const totals = cas3PremisesBedspaceTotalsFactory.build({
        premisesEndDate: futureDate.toISOString(),
        status: 'online',
      })

      expect(isPremiseScheduledToBeArchived(totals)).toBe(true)
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
      const rows = tableRows(premises, placeContext, 'online')

      const expectedRows = expectedResults.map(prem => {
        const address = [prem.addressLine1, prem.addressLine2, prem.town, prem.postcode]
          .filter(s => s !== undefined && s !== '')
          .join('<br />')

        const bedspaces =
          prem.bedspaces.length === 0
            ? `No bedspaces<br /><a href="/properties/${prem.id}/bedspaces/new">Add a bedspace</a>`
            : prem.bedspaces
                .sort((a, b) => {
                  const statusPriority = { online: 1, upcoming: 2, archived: 3 }
                  const aPriority = statusPriority[a.status]
                  const bPriority = statusPriority[b.status]
                  if (aPriority !== bPriority) {
                    return aPriority - bPriority
                  }
                  return a.reference.localeCompare(b.reference)
                })
                .map(bed => {
                  let bedspaceStatusTag = ''
                  if (bed.status === 'archived') {
                    bedspaceStatusTag = ` <strong class="govuk-tag govuk-tag--grey govuk-!-margin-left-2">Archived</strong>`
                  } else if (bed.status === 'upcoming') {
                    bedspaceStatusTag = ` <strong class="govuk-tag govuk-tag--blue govuk-!-margin-left-2">Upcoming</strong>`
                  }
                  return `<div class="govuk-!-margin-bottom-3"><a href="/properties/${prem.id}/bedspaces/${bed.id}?placeContextAssessmentId=${placeContext.assessment.id}&placeContextArrivalDate=${placeContext.arrivalDate}">${bed.reference}</a>${bedspaceStatusTag}</div>`
                })
                .join('')

        return [
          { html: address },
          { html: bedspaces },
          { text: prem.pdu },
          {
            html: `<a href="/properties/${prem.id}?placeContextAssessmentId=${placeContext.assessment.id}&placeContextArrivalDate=${placeContext.arrivalDate}">Manage<span class="govuk-visually-hidden"> property at ${prem.addressLine1}, ${prem.postcode}</span></a>`,
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

      const rows = tableRows(premises, placeContext, 'online', 'la')

      const address = [searchResult.addressLine1, searchResult.addressLine2, searchResult.town, searchResult.postcode]
        .filter(s => s !== undefined && s !== '')
        .join('<br />')

      const bedspaces = `No bedspaces<br /><a href="/properties/${searchResult.id}/bedspaces/new">Add a bedspace</a>`

      expect(rows).toEqual([
        [
          { html: address },
          { html: bedspaces },
          { text: searchResult.localAuthorityAreaName },
          {
            html: `<a href="/properties/${searchResult.id}?placeContextAssessmentId=${placeContext.assessment.id}&placeContextArrivalDate=${placeContext.arrivalDate}">Manage<span class="govuk-visually-hidden"> property at ${searchResult.addressLine1}, ${searchResult.postcode}</span></a>`,
          },
        ],
      ])
    })
  })

  describe('summaryList', () => {
    const onlinePremises = cas3PremisesFactory.build({ status: 'online', startDate: '2025-02-01' })
    const archivedPremises = cas3PremisesFactory.build({
      status: 'archived',
      startDate: '2025-03-02',
      scheduleUnarchiveDate: null,
    })

    it('should return a summary list for an online premises', async () => {
      const summary = summaryList(onlinePremises)

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
              html: onlinePremises.premisesCharacteristics
                .map(char => `<span class="hmpps-tag-filters">${char.description}</span>`)
                .join(' '),
            },
          },
          {
            key: { text: 'Additional property details' },
            value: { html: onlinePremises.notes.replace(/\n/g, '<br />') },
          },
        ],
      }

      expect(summary).toEqual(expectedSummaryList)
    })

    it('should return a summary list for an archived premises', async () => {
      const summary = summaryList(archivedPremises)

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
              html: archivedPremises.premisesCharacteristics
                .map(char => `<span class="hmpps-tag-filters">${char.description}</span>`)
                .join(' '),
            },
          },
          {
            key: { text: 'Additional property details' },
            value: { html: archivedPremises.notes.replace(/\n/g, '<br />') },
          },
        ],
      }

      expect(summary).toEqual(expectedSummaryList)
    })

    it('should show "None" for additional property details when there are no notes', () => {
      const premises = cas3PremisesFactory.build({ notes: '' })
      const summary = summaryList(premises)

      const additionalPropertyDetailsRow = summary.rows.find(
        row => (row.key as TextItem)?.text === 'Additional property details',
      )

      expect(additionalPropertyDetailsRow.value).toEqual({ html: 'None' })
    })

    it('should show "None" and "Add property details" link for property details when there are none', () => {
      const premises = cas3PremisesFactory.build({ premisesCharacteristics: [] })
      const summary = summaryList(premises)

      const propertyDetailsRow = summary.rows.find(row => (row.key as TextItem)?.text === 'Property details')

      const expectedHtml = `<p>None</p><p><a href="/properties/${premises.id}/edit">Add property details</a></p>`
      expect(propertyDetailsRow.value).toEqual({ html: expectedHtml })
    })

    it('includes scheduled archive date in the status row for online premises with endDate (scheduled archive)', () => {
      const premises = cas3PremisesFactory.build({
        status: 'online',
        endDate: '2125-08-20',
      })

      const summary = summaryList(premises)
      const statusRowValue = (summary.rows[0].value as { html: string }).html

      expect(statusRowValue).toContain('<strong class="govuk-tag govuk-tag--green">Online</strong>')
      expect(statusRowValue).toContain('Scheduled archive date 20 August 2125')
    })

    it('includes scheduled online date in the status row for archived premises with future startDate (scheduled online)', () => {
      const premises = cas3PremisesFactory.build({
        status: 'archived',
        scheduleUnarchiveDate: '2125-08-20',
      })

      const summary = summaryList(premises)
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

      const summary = summaryList(premises)
      const archiveRow = summary.rows.find(row => (row.key as { text: string }).text === 'Archive history')

      if ('html' in archiveRow.value) {
        expect(archiveRow.value.html).toContain('<details class="govuk-details">')
        expect(archiveRow.value.html).toContain('Full history')
        expect(archiveRow.value.html).toContain('Online date')
        expect(archiveRow.value.html).toContain('Archive date')
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

      const summary = summaryList(premises)
      const archiveRow = summary.rows.find(row => (row.key as { text: string }).text === 'Archive history')
      if ('html' in archiveRow.value) {
        expect(archiveRow.value.html).not.toContain('<details class="govuk-details">')
        expect(archiveRow.value.html).not.toContain('Full history')
        expect(archiveRow.value.html).toContain('Online date')
        expect(archiveRow.value.html).toContain('Archive date')
      } else {
        throw new Error('No html property found in archiveRow.value')
      }
    })
  })

  describe('shortSummaryList', () => {
    const onlinePremises = cas3PremisesFactory.build({ status: 'online', startDate: '2025-04-05' })
    const archivedPremises = cas3PremisesFactory.build({
      status: 'archived',
      startDate: '2025-05-06',
      scheduleUnarchiveDate: null,
    })

    it('should return a short summary list for an online premises', () => {
      const summary = shortSummaryList(onlinePremises)

      expect(summary).toEqual({
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
      const summary = shortSummaryList(archivedPremises)

      expect(summary).toEqual({
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
})
