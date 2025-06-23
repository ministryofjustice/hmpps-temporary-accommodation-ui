import { DeepMocked, createMock } from '@golevelup/ts-jest'
import { NextFunction, Request, Response } from 'express'
import { Cas3Bedspace } from '@approved-premises/api'
import { SummaryList } from '@approved-premises/ui'
import { CallConfig } from '../../../../data/restClient'
import BedspaceService from '../../../../services/v2/bedspaceService'
import BedspacesController from './bedspacesController'
import { cas3BedspaceFactory, characteristicFactory, probationRegionFactory } from '../../../../testutils/factories'
import extractCallConfig from '../../../../utils/restUtils'

jest.mock('../../../../utils/restUtils')

describe('BedspacesController', () => {
  const callConfig = { token: 'some-call-config-token' } as CallConfig

  let request: Request

  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const bedspaceService = createMock<BedspaceService>({})

  const bedspaceController = new BedspacesController(bedspaceService)

  beforeEach(() => {
    request = createMock<Request>({
      session: {
        probationRegion: probationRegionFactory.build(),
      },
    })
    ;(extractCallConfig as jest.MockedFn<typeof extractCallConfig>).mockReturnValue(callConfig)
  })

  describe('show', () => {
    const premisesId = 'some-premises-id'
    const bedspaceId = 'some-bedspace-id'

    const characteristic1 = characteristicFactory.build({ serviceScope: 'temporary-accommodation' })
    const characteristic2 = characteristicFactory.build({ serviceScope: 'temporary-accommodation' })

    const onlineBedspace = cas3BedspaceFactory.build({
      status: 'online',
      startDate: '2024-11-23',
      characteristics: [characteristic1, characteristic2],
    })
    const onlineBedspaceWithSummary: Cas3Bedspace & { summary: SummaryList } = {
      ...onlineBedspace,
      summary: {
        rows: [
          {
            key: { text: 'Bedspace status' },
            value: { html: `<strong class="govuk-tag govuk-tag--green">Online</strong>` },
          },
          {
            key: { text: 'Start date' },
            value: { text: '23 November 2024' },
          },
          {
            key: { text: 'Bedspace details' },
            value: {
              html: `<span class="hmpps-tag-filters">Characteristic 1</span> <span class="hmpps-tag-filters">Characteristic 2</span>`,
            },
          },
          {
            key: { text: 'Addition bedspace details' },
            value: { text: onlineBedspace.notes },
          },
        ],
      },
    }

    const archivedBedspace = cas3BedspaceFactory.build({
      status: 'archived',
      startDate: '2023-10-22',
      characteristics: [characteristic1],
    })
    const archivedBedspaceWithSummary: Cas3Bedspace & { summary: SummaryList } = {
      ...archivedBedspace,
      summary: {
        rows: [
          {
            key: { text: 'Bedspace status' },
            value: { html: `<strong class="govuk-tag govuk-tag--grey">Archived</strong>` },
          },
          {
            key: { text: 'Start date' },
            value: { text: '22 October 2023' },
          },
          {
            key: { text: 'Bedspace details' },
            value: { html: `<span class="hmpps-tag-filters">Characteristic 1</span>` },
          },
          {
            key: { text: 'Addition bedspace details' },
            value: { text: archivedBedspace.notes },
          },
        ],
      },
    }

    const upcomingBedspace = cas3BedspaceFactory.build({
      status: 'upcoming',
      startDate: '2025-09-21',
      characteristics: [characteristic2],
    })
    const upcomingBedspaceWithSummary: Cas3Bedspace & { summary: SummaryList } = {
      ...upcomingBedspace,
      summary: {
        rows: [
          {
            key: { text: 'Bedspace status' },
            value: { html: `<strong class="govuk-tag govuk-tag--blue">Upcoming</strong>` },
          },
          {
            key: { text: 'Start date' },
            value: { text: '21 September 2025' },
          },
          {
            key: { text: 'Bedspace details' },
            value: { html: `<span class="hmpps-tag-filters">Characteristic 2</span>` },
          },
          {
            key: { text: 'Addition bedspace details' },
            value: { text: upcomingBedspace.notes },
          },
        ],
      },
    }

    it.each([[onlineBedspaceWithSummary], [archivedBedspaceWithSummary], [upcomingBedspaceWithSummary]])(
      'should return a bedspace with no bookings',
      async bedspace => {
        const params = { premisesId, bedspaceId }

        bedspaceService.getSingleBedspaceDetails.mockResolvedValue(bedspace)

        request = createMock<Request>({
          session: {
            probationRegion: probationRegionFactory.build(),
          },
          params,
        })

        const requestHandler = bedspaceController.show()
        await requestHandler(request, response, next)

        expect(response.render).toHaveBeenCalledWith('temporary-accommodation/v2/bedspaces/show', {
          premisesId,
          bedspace,
          actions: [],
        })

        expect(bedspaceService.getSingleBedspaceDetails).toHaveBeenCalledWith(callConfig, premisesId, bedspaceId)
      },
    )

    it('should return a bedspace with bookings', async () => {
      const params = { premisesId, bedspaceId }

      bedspaceService.getSingleBedspaceDetails.mockResolvedValue(onlineBedspaceWithSummary)

      request = createMock<Request>({
        session: {
          probationRegion: probationRegionFactory.build(),
        },
        params,
      })

      const requestHandler = bedspaceController.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/v2/bedspaces/show', {
        premisesId,
        bedspace: onlineBedspaceWithSummary,
        actions: [],
      })

      expect(bedspaceService.getSingleBedspaceDetails).toHaveBeenCalledWith(callConfig, premisesId, bedspaceId)
    })
  })
})
