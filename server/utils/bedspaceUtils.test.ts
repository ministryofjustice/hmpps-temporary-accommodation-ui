import {
  assessmentFactory,
  cas3BedspaceArchiveActionFactory,
  cas3BedspaceFactory,
  cas3PremisesFactory,
  placeContextFactory,
} from '../testutils/factories'
import { bedspaceActions, summaryList, summaryListForBedspaceStatus } from './bedspaceUtils'
import paths from '../paths/temporary-accommodation/manage'
import config from '../config'
import { convertToTitleCase } from './utils'

jest.mock('../config')

describe('bedspaceV2Utils', () => {
  config.flags.cancelScheduledArchiveEnabled = true

  describe('bedspaceActions', () => {
    const placeContext = placeContextFactory.build({
      assessment: assessmentFactory.build({
        accommodationRequiredFromDate: '2025-08-27',
      }),
    })
    const placeContextQueryString = `placeContextAssessmentId=${placeContext.assessment.id}&placeContextArrivalDate=${placeContext.arrivalDate}`

    it('returns correct actions for an online bedspace', () => {
      const premises = cas3PremisesFactory.build()
      const bedspace = cas3BedspaceFactory.build({ status: 'online', endDate: undefined })

      const actions = bedspaceActions(premises, bedspace, placeContext)

      expect(actions).toHaveLength(4)
      expect(actions).toContainEqual({
        text: 'Book bedspace',
        href: `${paths.bookings.new({ premisesId: premises.id, bedspaceId: bedspace.id })}?${placeContextQueryString}`,
        classes: 'govuk-button--secondary',
      })
      expect(actions).toContainEqual({
        text: 'Void bedspace',
        href: paths.lostBeds.new({ premisesId: premises.id, bedspaceId: bedspace.id }),
        classes: 'govuk-button--secondary',
      })
      expect(actions).toContainEqual({
        text: 'Archive bedspace',
        href: paths.premises.bedspaces.archive({ premisesId: premises.id, bedspaceId: bedspace.id }),
        classes: 'govuk-button--secondary',
      })
      expect(actions).toContainEqual({
        text: 'Edit bedspace details',
        href: `${paths.premises.bedspaces.edit({ premisesId: premises.id, bedspaceId: bedspace.id })}?${placeContextQueryString}`,
        classes: 'govuk-button--secondary',
      })
    })

    it('returns correct actions for an online bedspace with scheduled archive', () => {
      const premises = cas3PremisesFactory.build()
      const bedspace = cas3BedspaceFactory.build({ status: 'online', endDate: '2125-08-20' })

      const actions = bedspaceActions(premises, bedspace, placeContext)

      expect(actions).toHaveLength(4)
      expect(actions).toContainEqual({
        text: 'Book bedspace',
        href: `${paths.bookings.new({ premisesId: premises.id, bedspaceId: bedspace.id })}?${placeContextQueryString}`,
        classes: 'govuk-button--secondary',
      })
      expect(actions).toContainEqual({
        text: 'Void bedspace',
        href: paths.lostBeds.new({ premisesId: premises.id, bedspaceId: bedspace.id }),
        classes: 'govuk-button--secondary',
      })
      expect(actions).toContainEqual({
        text: 'Cancel scheduled bedspace archive',
        href: paths.premises.bedspaces.cancelArchive({ premisesId: premises.id, bedspaceId: bedspace.id }),
        classes: 'govuk-button--secondary',
      })
      expect(actions).toContainEqual({
        text: 'Edit bedspace details',
        href: `${paths.premises.bedspaces.edit({ premisesId: premises.id, bedspaceId: bedspace.id })}?${placeContextQueryString}`,
        classes: 'govuk-button--secondary',
      })
    })

    it('returns correct actions for an archived bedspace', () => {
      const premises = cas3PremisesFactory.build()
      const bedspace = cas3BedspaceFactory.build({ status: 'archived' })

      const actions = bedspaceActions(premises, bedspace, placeContext)

      expect(actions).toHaveLength(2)
      expect(actions).toContainEqual({
        text: 'Make bedspace online',
        href: paths.premises.bedspaces.unarchive({ premisesId: premises.id, bedspaceId: bedspace.id }),
        classes: 'govuk-button--secondary',
      })
      expect(actions).toContainEqual({
        text: 'Edit bedspace details',
        href: `${paths.premises.bedspaces.edit({ premisesId: premises.id, bedspaceId: bedspace.id })}?${placeContextQueryString}`,
        classes: 'govuk-button--secondary',
      })
    })

    it('returns correct actions for an upcoming new bedspace', () => {
      const premises = cas3PremisesFactory.build()
      const bedspace = cas3BedspaceFactory.build({
        status: 'upcoming',
        archiveHistory: [],
      })

      const actions = bedspaceActions(premises, bedspace, placeContext)

      expect(actions).toHaveLength(1)
      expect(actions).toContainEqual({
        text: 'Edit bedspace details',
        href: `${paths.premises.bedspaces.edit({ premisesId: premises.id, bedspaceId: bedspace.id })}?${placeContextQueryString}`,
        classes: 'govuk-button--secondary',
      })
    })

    it('returns correct actions for an upcoming bedspace that was previously archived', () => {
      const premises = cas3PremisesFactory.build()
      const bedspace = cas3BedspaceFactory.build({
        status: 'upcoming',
        archiveHistory: [
          {
            date: '2024-01-01',
            status: 'archived',
          },
        ],
      })

      const actions = bedspaceActions(premises, bedspace, placeContext)

      expect(actions).toHaveLength(2)
      expect(actions).toContainEqual({
        text: 'Cancel scheduled bedspace online date',
        href: paths.premises.bedspaces.cancelUnarchive({ premisesId: premises.id, bedspaceId: bedspace.id }),
        classes: 'govuk-button--secondary',
      })
      expect(actions).toContainEqual({
        text: 'Edit bedspace details',
        href: `${paths.premises.bedspaces.edit({ premisesId: premises.id, bedspaceId: bedspace.id })}?${placeContextQueryString}`,
        classes: 'govuk-button--secondary',
      })
    })
  })

  describe('summaryList', () => {
    it.each([
      [
        cas3BedspaceFactory.build({
          status: 'online',
          startDate: '2025-01-02T03:04:05.678912Z',
          archiveHistory: [cas3BedspaceArchiveActionFactory.build({ date: '2025-01-02T03:04:05.678912Z' })],
        }),
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
    ])('returns the summaryList for a bedspace', async (bedspace, status, tagColour, formattedDate) => {
      const rows = [
        {
          key: { text: 'Bedspace status' },
          value: { html: `<strong class="govuk-tag govuk-tag--${tagColour}">${status}</strong>` },
        },
        {
          key: { text: 'Start date' },
          value: { text: formattedDate },
        },
      ]

      if (bedspace.archiveHistory && bedspace.archiveHistory.length > 0) {
        rows.push({
          key: { text: 'Archive history' },
          value: {
            html: bedspace.archiveHistory
              .map(archive => {
                const verb = archive.status === 'archived' ? 'Archive' : convertToTitleCase(archive.status)
                return `<div>${verb} date ${formattedDate}</div>`
              })
              .join(''),
          },
        })
      }

      rows.push(
        {
          key: { text: 'Bedspace details' },
          value: {
            html: bedspace.bedspaceCharacteristics
              .map(characteristic => `<span class="hmpps-tag-filters">${characteristic.description}</span>`)
              .join(' '),
          },
        },
        {
          key: { text: 'Additional bedspace details' },
          value: { html: bedspace.notes.replace(/\n/g, '<br />') },
        },
      )
      const expectedSummary = {
        rows,
      }

      const result = summaryList(bedspace)

      expect(result).toEqual(expectedSummary)
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
              html: bedspace.bedspaceCharacteristics
                .map(characteristic => `<span class="hmpps-tag-filters">${characteristic.description}</span>`)
                .join(' '),
            },
          },
          {
            key: { text: 'Additional bedspace details' },
            value: { html: bedspace.notes.replace(/\n/g, '<br />') },
          },
        ],
      }

      const summary = summaryList(bedspace)

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
              html: bedspace.bedspaceCharacteristics
                .map(characteristic => `<span class="hmpps-tag-filters">${characteristic.description}</span>`)
                .join(' '),
            },
          },
          {
            key: { text: 'Additional bedspace details' },
            value: { html: bedspace.notes.replace(/\n/g, '<br />') },
          },
        ],
      }

      const summary = summaryList(bedspace)

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
              html: bedspace.bedspaceCharacteristics
                .map(characteristic => `<span class="hmpps-tag-filters">${characteristic.description}</span>`)
                .join(' '),
            },
          },
          {
            key: { text: 'Additional bedspace details' },
            value: { html: bedspace.notes.replace(/\n/g, '<br />') },
          },
        ],
      }

      const summary = summaryList(bedspace)

      expect(summary).toEqual(expectedSummary)
    })

    it('includes scheduled archive date in the status row for online bedspaces with endDate (scheduled archive)', () => {
      const bedspace = cas3BedspaceFactory.build({
        status: 'online',
        endDate: '2125-08-20',
      })

      const summary = summaryList(bedspace)
      const statusRowValue = (summary.rows[0].value as { html: string }).html

      expect(statusRowValue).toContain('<strong class="govuk-tag govuk-tag--green">Online</strong>')
      expect(statusRowValue).toContain('Scheduled archive date 20 August 2125')
    })

    it('includes scheduled online date in the status row for archived bedspaces with future startDate (scheduled online)', () => {
      const bedspace = cas3BedspaceFactory.build({
        status: 'archived',
        scheduleUnarchiveDate: '2125-08-20',
      })

      const summary = summaryList(bedspace)
      const statusRowValue = (summary.rows[0].value as { html: string }).html

      expect(statusRowValue).toContain('<strong class="govuk-tag govuk-tag--grey">Archived</strong>')
      expect(statusRowValue).toContain('Scheduled online date 20 August 2125')
    })
  })

  describe('summaryListForBedspaceStatus', () => {
    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(new Date('2025-10-22'))
    })
    it('returns a summaryList of the status for an online bedspace', () => {
      const bedspace = cas3BedspaceFactory.build({ status: 'online', endDate: '2026-01-01' })
      const expectedSummary = {
        rows: [
          {
            key: { text: 'Bedspace status' },
            value: { html: '<span class="govuk-tag govuk-tag--green">Online</span>' },
          },
          {
            key: { text: 'Bedspace end date' },
            value: { text: '1 January 2026 (in 71 days)' },
          },
        ],
      }

      expect(summaryListForBedspaceStatus(bedspace)).toEqual(expectedSummary)
    })

    it('returns a summaryList of the status for an archived bedspace', () => {
      const bedspace = cas3BedspaceFactory.build({ status: 'archived', endDate: '2025-06-18' })
      const expectedSummary = {
        rows: [
          {
            key: { text: 'Bedspace status' },
            value: { html: '<span class="govuk-tag govuk-tag--grey">Archived</span>' },
          },
          {
            key: { text: 'Bedspace end date' },
            value: { text: '18 June 2025' },
          },
        ],
      }

      expect(summaryListForBedspaceStatus(bedspace)).toEqual(expectedSummary)
    })

    it('returns a summaryList of the status for a bedspace with no end date', () => {
      const bedspace = cas3BedspaceFactory.build({ status: 'online', endDate: null })
      const expectedSummary = {
        rows: [
          {
            key: { text: 'Bedspace status' },
            value: { html: '<span class="govuk-tag govuk-tag--green">Online</span>' },
          },
          {
            key: { text: 'Bedspace end date' },
            value: { text: 'No end date added' },
          },
        ],
      }

      expect(summaryListForBedspaceStatus(bedspace)).toEqual(expectedSummary)
    })
  })
})
