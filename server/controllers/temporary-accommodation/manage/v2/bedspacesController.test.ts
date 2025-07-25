import { DeepMocked, createMock } from '@golevelup/ts-jest'
import { NextFunction, Request, Response } from 'express'
import { Cas3Bedspace } from '@approved-premises/api'
import { SummaryList } from '@approved-premises/ui'
import { CallConfig } from '../../../../data/restClient'
import BedspaceService from '../../../../services/v2/bedspaceService'
import BedspacesController from './bedspacesController'
import {
  cas3BedspaceFactory,
  cas3PremisesFactory,
  characteristicFactory,
  probationRegionFactory,
  referenceDataFactory,
} from '../../../../testutils/factories'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../../../utils/validation'
import extractCallConfig from '../../../../utils/restUtils'
import PremisesService from '../../../../services/v2/premisesService'
import { DateFormats } from '../../../../utils/dateUtils'
import paths from '../../../../paths/temporary-accommodation/manage'

jest.mock('../../../../utils/validation')
jest.mock('../../../../utils/restUtils')

describe('BedspacesController', () => {
  const callConfig = { token: 'some-call-config-token' } as CallConfig
  const premisesId = 'some-premises-id'
  const bedspaceId = 'some-bedspace-id'
  const referenceData = {
    characteristics: referenceDataFactory.characteristic('room').buildList(5),
  }

  let request: Request

  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const bedspaceService = createMock<BedspaceService>({})
  const premisesService = createMock<PremisesService>({})

  const bedspacesController = new BedspacesController(premisesService, bedspaceService)

  beforeEach(() => {
    jest.clearAllMocks()
    request = createMock<Request>({
      session: {
        probationRegion: probationRegionFactory.build(),
      },
    })
    ;(extractCallConfig as jest.MockedFn<typeof extractCallConfig>).mockReturnValue(callConfig)
  })

  describe('new', () => {
    it('renders the form', async () => {
      const premises = cas3PremisesFactory.build()

      bedspaceService.getReferenceData.mockResolvedValue(referenceData)
      premisesService.getSinglePremises.mockResolvedValue(premises)

      const requestHandler = bedspacesController.new()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({ errors: {}, errorSummary: [], userInput: {} })

      request.params = { premisesId: premises.id }
      await requestHandler(request, response, next)

      expect(bedspaceService.getReferenceData).toHaveBeenCalledWith(callConfig)
      expect(premisesService.getSinglePremises).toHaveBeenCalledWith(callConfig, premises.id)
      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/v2/bedspaces/new', {
        allCharacteristics: referenceData.characteristics,
        characteristicIds: [],
        premises,
        errors: {},
        errorSummary: [],
      })
    })
  })

  describe('create', () => {
    it('creates a bedspace and redirects to the show bedspace page', async () => {
      const requestHandler = bedspacesController.create()

      const bedspace = cas3BedspaceFactory.build()

      request.params = {
        premisesId,
      }
      request.body = {
        reference: bedspace.reference,
        notes: bedspace.notes,
        ...DateFormats.isoToDateAndTimeInputs(bedspace.startDate, 'startDate'),
      }

      bedspaceService.createBedspace.mockResolvedValue(bedspace)

      await requestHandler(request, response, next)

      expect(bedspaceService.createBedspace).toHaveBeenCalledWith(
        callConfig,
        premisesId,
        expect.objectContaining({
          reference: bedspace.reference,
          characteristicIds: [],
          notes: bedspace.notes,
          startDate: bedspace.startDate,
        }),
      )

      expect(request.flash).toHaveBeenCalledWith('success', 'Bedspace created')
      expect(response.redirect).toHaveBeenCalledWith(
        paths.premises.v2.bedspaces.show({ premisesId, bedspaceId: bedspace.id }),
      )
    })

    it('renders with errors if the API returns an error', async () => {
      const requestHandler = bedspacesController.create()

      const err = new Error()

      bedspaceService.createBedspace.mockImplementation(() => {
        throw err
      })

      const bedspace = cas3BedspaceFactory.build()

      request.params = {
        premisesId,
      }
      request.body = {
        reference: bedspace.reference,
        notes: bedspace.notes,
      }

      requestHandler(request, response, next)

      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        err,
        paths.premises.v2.bedspaces.new({ premisesId }),
      )
    })
  })

  describe('show', () => {
    const characteristic1 = characteristicFactory.build({ serviceScope: 'temporary-accommodation' })
    const characteristic2 = characteristicFactory.build({ serviceScope: 'temporary-accommodation' })

    const premises = cas3PremisesFactory.build({
      addressLine1: '62 West Wallaby Street',
      addressLine2: undefined,
      town: 'Wigan',
      postcode: 'WG7 7FU',
    })
    const premisesWithFullAddress = {
      ...premises,
      fullAddress: '62 West Wallaby Street<br />Wigan<br />WG7 7FU',
    }

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
            key: { text: 'Additional bedspace details' },
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
            key: { text: 'Additional bedspace details' },
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
            key: { text: 'Additional bedspace details' },
            value: { text: upcomingBedspace.notes },
          },
        ],
      },
    }

    it.each([[onlineBedspaceWithSummary], [archivedBedspaceWithSummary], [upcomingBedspaceWithSummary]])(
      'should return a bedspace',
      async bedspace => {
        const params = { premisesId, bedspaceId }

        premisesService.getSinglePremisesDetails.mockResolvedValue(premisesWithFullAddress)
        bedspaceService.getSingleBedspaceDetails.mockResolvedValue(bedspace)

        request = createMock<Request>({
          session: {
            probationRegion: probationRegionFactory.build(),
          },
          params,
        })

        const requestHandler = bedspacesController.show()
        await requestHandler(request, response, next)

        const expectedActions =
          bedspace.status === 'archived'
            ? []
            : [
                {
                  text: 'Archive',
                  classes: 'govuk-button--secondary moj-button-menu__item',
                  href: paths.premises.v2.bedspaces.archive({ premisesId, bedspaceId }),
                },
              ]

        expect(response.render).toHaveBeenCalledWith('temporary-accommodation/v2/bedspaces/show', {
          premises: premisesWithFullAddress,
          bedspace,
          actions: expectedActions,
        })

        expect(bedspaceService.getSingleBedspaceDetails).toHaveBeenCalledWith(callConfig, premisesId, bedspaceId)
      },
    )
  })

  describe('show - archive button visibility', () => {
    it('should not show archive button when bedspace is already archived', async () => {
      const archivedBedspace = cas3BedspaceFactory.build({
        status: 'archived',
        startDate: '2023-10-22',
        characteristics: [characteristicFactory.build({ serviceScope: 'temporary-accommodation' })],
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
              key: { text: 'Additional bedspace details' },
              value: { text: archivedBedspace.notes },
            },
          ],
        },
      }

      const premises = cas3PremisesFactory.build({
        addressLine1: '62 West Wallaby Street',
        addressLine2: undefined,
        town: 'Wigan',
        postcode: 'WG7 7FU',
      })
      const premisesWithFullAddress = {
        ...premises,
        fullAddress: '62 West Wallaby Street<br />Wigan<br />WG7 7FU',
      }

      const params = { premisesId, bedspaceId }

      premisesService.getSinglePremisesDetails.mockResolvedValue(premisesWithFullAddress)
      bedspaceService.getSingleBedspaceDetails.mockResolvedValue(archivedBedspaceWithSummary)

      request = createMock<Request>({
        session: {
          probationRegion: probationRegionFactory.build(),
        },
        params,
      })

      const requestHandler = bedspacesController.show()
      await requestHandler(request, response, next)

      // Verify that no archive button is present in the actions array
      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/v2/bedspaces/show', {
        premises: premisesWithFullAddress,
        bedspace: archivedBedspaceWithSummary,
        actions: [], // Empty actions array - no archive button should be visible
      })

      expect(bedspaceService.getSingleBedspaceDetails).toHaveBeenCalledWith(callConfig, premisesId, bedspaceId)
    })

    it('should show archive button when bedspace is online', async () => {
      const onlineBedspace = cas3BedspaceFactory.build({
        status: 'online',
        startDate: '2024-11-23',
        characteristics: [characteristicFactory.build({ serviceScope: 'temporary-accommodation' })],
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
              value: { html: `<span class="hmpps-tag-filters">Characteristic 1</span>` },
            },
            {
              key: { text: 'Additional bedspace details' },
              value: { text: onlineBedspace.notes },
            },
          ],
        },
      }

      const premises = cas3PremisesFactory.build({
        addressLine1: '62 West Wallaby Street',
        addressLine2: undefined,
        town: 'Wigan',
        postcode: 'WG7 7FU',
      })
      const premisesWithFullAddress = {
        ...premises,
        fullAddress: '62 West Wallaby Street<br />Wigan<br />WG7 7FU',
      }

      const params = { premisesId, bedspaceId }

      premisesService.getSinglePremisesDetails.mockResolvedValue(premisesWithFullAddress)
      bedspaceService.getSingleBedspaceDetails.mockResolvedValue(onlineBedspaceWithSummary)

      request = createMock<Request>({
        session: {
          probationRegion: probationRegionFactory.build(),
        },
        params,
      })

      const requestHandler = bedspacesController.show()
      await requestHandler(request, response, next)

      // Verify that archive button is present in the actions array
      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/v2/bedspaces/show', {
        premises: premisesWithFullAddress,
        bedspace: onlineBedspaceWithSummary,
        actions: [
          {
            text: 'Archive',
            classes: 'govuk-button--secondary moj-button-menu__item',
            href: paths.premises.v2.bedspaces.archive({ premisesId, bedspaceId }),
          },
        ],
      })

      expect(bedspaceService.getSingleBedspaceDetails).toHaveBeenCalledWith(callConfig, premisesId, bedspaceId)
    })
  })

  describe('archive', () => {
    it('renders the archive form', async () => {
      const bedspace = cas3BedspaceFactory.build()
      const bedspaceWithSummary: Cas3Bedspace & { summary: SummaryList } = {
        ...bedspace,
        summary: { rows: [] },
      }
      const params = { premisesId, bedspaceId }

      bedspaceService.getSingleBedspaceDetails.mockResolvedValue(bedspaceWithSummary)
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({ errors: {}, errorSummary: [], userInput: {} })

      request = createMock<Request>({
        session: {
          probationRegion: probationRegionFactory.build(),
        },
        params,
      })

      const requestHandler = bedspacesController.archive()
      await requestHandler(request, response, next)

      expect(bedspaceService.getSingleBedspaceDetails).toHaveBeenCalledWith(callConfig, premisesId, bedspaceId)
      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/v2/bedspaces/archive', {
        bedspace: bedspaceWithSummary,
        params,
        errors: {},
        errorSummary: [],
        archiveOption: 'today',
      })
    })

    it('renders the archive form with existing user input preserved', async () => {
      const bedspace = cas3BedspaceFactory.build()
      const bedspaceWithSummary: Cas3Bedspace & { summary: SummaryList } = {
        ...bedspace,
        summary: { rows: [] },
      }
      const params = { premisesId, bedspaceId }

      bedspaceService.getSingleBedspaceDetails.mockResolvedValue(bedspaceWithSummary)
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({
        errors: {},
        errorSummary: [],
        userInput: { archiveOption: 'anotherDate' },
      })

      request = createMock<Request>({
        session: {
          probationRegion: probationRegionFactory.build(),
        },
        params,
      })

      const requestHandler = bedspacesController.archive()
      await requestHandler(request, response, next)

      expect(bedspaceService.getSingleBedspaceDetails).toHaveBeenCalledWith(callConfig, premisesId, bedspaceId)
      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/v2/bedspaces/archive', {
        bedspace: bedspaceWithSummary,
        params,
        errors: {},
        errorSummary: [],
        archiveOption: 'anotherDate',
      })
    })
  })

  describe('archiveSubmit', () => {
    it('archives a bedspace with today option and redirects to show page', async () => {
      const params = { premisesId, bedspaceId }

      request = createMock<Request>({
        session: {
          probationRegion: probationRegionFactory.build(),
        },
        params,
        body: {
          archiveOption: 'today',
        },
      })

      bedspaceService.archiveBedspace.mockResolvedValue()

      const requestHandler = bedspacesController.archiveSubmit()
      await requestHandler(request, response, next)

      expect(bedspaceService.archiveBedspace).toHaveBeenCalledWith(
        callConfig,
        premisesId,
        bedspaceId,
        expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/), // Today's date in ISO format
      )

      expect(request.flash).toHaveBeenCalledWith('success', 'Bedspace archived')
      expect(response.redirect).toHaveBeenCalledWith(paths.premises.v2.bedspaces.show({ premisesId, bedspaceId }))
    })

    it('handles invalid/empty date error', async () => {
      const params = { premisesId, bedspaceId }

      request = createMock<Request>({
        session: {
          probationRegion: probationRegionFactory.build(),
        },
        params,
        body: {
          archiveOption: 'anotherDate',
          'archiveDate-day': '',
          'archiveDate-month': '',
          'archiveDate-year': '',
        },
      })

      const error = {
        status: 400,
        data: {
          'invalid-params': [
            {
              propertyName: '$.endDate',
              errorType: 'invalid',
              errorDetail: null as never,
            },
          ],
          title: 'Bad Request',
          status: 400,
          detail: 'There is a problem with your request',
        },
      }

      bedspaceService.archiveBedspace.mockRejectedValue(error)

      const requestHandler = bedspacesController.archiveSubmit()
      await requestHandler(request, response, next)

      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        error,
        paths.premises.v2.bedspaces.archive({ premisesId, bedspaceId }),
        'bedspaceArchive',
      )
    })

    it('handles invalidEndDateInTheFuture error using standard validation pattern', async () => {
      const params = { premisesId, bedspaceId }

      request = createMock<Request>({
        session: {
          probationRegion: probationRegionFactory.build(),
        },
        params,
        body: {
          archiveOption: 'today',
        },
      })

      const error = {
        status: 400,
        data: {
          'invalid-params': [
            {
              propertyName: '$.endDate',
              errorType: 'invalidEndDateInTheFuture',
              errorDetail: null as never,
            },
          ],
          title: 'Bad Request',
          status: 400,
          detail: 'There is a problem with your request',
        },
      }

      bedspaceService.archiveBedspace.mockRejectedValue(error)

      const requestHandler = bedspacesController.archiveSubmit()
      await requestHandler(request, response, next)

      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        error,
        paths.premises.v2.bedspaces.archive({ premisesId, bedspaceId }),
        'bedspaceArchive',
      )
    })

    it('handles existingBookings error using standard validation pattern', async () => {
      const params = { premisesId, bedspaceId }

      request = createMock<Request>({
        session: {
          probationRegion: probationRegionFactory.build(),
        },
        params,
        body: {
          archiveOption: 'anotherDate',
          'archiveDate-day': '25',
          'archiveDate-month': '7',
          'archiveDate-year': '2025',
        },
      })

      const error = {
        status: 400,
        data: {
          'invalid-params': [
            {
              propertyName: '$.endDate',
              errorType: 'existingBookings',
              errorDetail: null as never,
            },
          ],
        },
      }

      bedspaceService.archiveBedspace.mockRejectedValue(error)

      const requestHandler = bedspacesController.archiveSubmit()
      await requestHandler(request, response, next)

      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        error,
        paths.premises.v2.bedspaces.archive({ premisesId, bedspaceId }),
        'bedspaceArchive',
      )
    })

    it('handles existingVoid error using standard validation pattern', async () => {
      const params = { premisesId, bedspaceId }

      request = createMock<Request>({
        session: {
          probationRegion: probationRegionFactory.build(),
        },
        params,
        body: {
          archiveOption: 'anotherDate',
          'archiveDate-day': '25',
          'archiveDate-month': '7',
          'archiveDate-year': '2025',
        },
      })

      const error = {
        status: 400,
        data: {
          'invalid-params': [
            {
              propertyName: '$.endDate',
              errorType: 'existingVoid',
              errorDetail: null as never,
            },
          ],
        },
      }

      bedspaceService.archiveBedspace.mockRejectedValue(error)

      const requestHandler = bedspacesController.archiveSubmit()
      await requestHandler(request, response, next)

      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        error,
        paths.premises.v2.bedspaces.archive({ premisesId, bedspaceId }),
        'bedspaceArchive',
      )
    })

    it('handles existingTurnaround error using standard validation pattern', async () => {
      const params = { premisesId, bedspaceId }

      request = createMock<Request>({
        session: {
          probationRegion: probationRegionFactory.build(),
        },
        params,
        body: {
          archiveOption: 'anotherDate',
          'archiveDate-day': '25',
          'archiveDate-month': '7',
          'archiveDate-year': '2025',
        },
      })

      const error = {
        status: 400,
        data: {
          'invalid-params': [
            {
              propertyName: '$.endDate',
              errorType: 'existingTurnaround',
              errorDetail: null as never,
            },
          ],
        },
      }

      bedspaceService.archiveBedspace.mockRejectedValue(error)

      const requestHandler = bedspacesController.archiveSubmit()
      await requestHandler(request, response, next)

      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        error,
        paths.premises.v2.bedspaces.archive({ premisesId, bedspaceId }),
        'bedspaceArchive',
      )
    })

    it('handles invalidEndDateInThePast error using standard validation pattern', async () => {
      const params = { premisesId, bedspaceId }

      request = createMock<Request>({
        session: {
          probationRegion: probationRegionFactory.build(),
        },
        params,
        body: {
          archiveOption: 'anotherDate',
          'archiveDate-day': '17',
          'archiveDate-month': '7',
          'archiveDate-year': '2025',
        },
      })

      const error = {
        status: 400,
        data: {
          'invalid-params': [
            {
              propertyName: '$.endDate',
              errorType: 'invalidEndDateInThePast',
              errorDetail: null as never,
            },
          ],
          title: 'Bad Request',
          status: 400,
          detail: 'There is a problem with your request',
        },
      }

      bedspaceService.archiveBedspace.mockRejectedValue(error)

      const requestHandler = bedspacesController.archiveSubmit()
      await requestHandler(request, response, next)

      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        error,
        paths.premises.v2.bedspaces.archive({ premisesId, bedspaceId }),
        'bedspaceArchive',
      )
    })

    it('archives a bedspace with another date option and redirects to show page', async () => {
      const params = { premisesId, bedspaceId }

      request = createMock<Request>({
        session: {
          probationRegion: probationRegionFactory.build(),
        },
        params,
        body: {
          archiveOption: 'anotherDate',
          'archiveDate-day': '25',
          'archiveDate-month': '12',
          'archiveDate-year': '2025',
        },
      })

      bedspaceService.archiveBedspace.mockResolvedValue()

      const requestHandler = bedspacesController.archiveSubmit()
      await requestHandler(request, response, next)

      expect(bedspaceService.archiveBedspace).toHaveBeenCalledWith(callConfig, premisesId, bedspaceId, '2025-12-25')

      expect(request.flash).toHaveBeenCalledWith('success', 'Bedspace archived')
      expect(response.redirect).toHaveBeenCalledWith(paths.premises.v2.bedspaces.show({ premisesId, bedspaceId }))
    })

    it('handles non-validation API errors by propagating them', async () => {
      const params = { premisesId, bedspaceId }

      request = createMock<Request>({
        session: {
          probationRegion: probationRegionFactory.build(),
        },
        params,
        body: {
          archiveOption: 'today',
        },
      })

      const error = new Error('Network error')
      bedspaceService.archiveBedspace.mockRejectedValue(error)

      const requestHandler = bedspacesController.archiveSubmit()
      await requestHandler(request, response, next)

      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        error,
        paths.premises.v2.bedspaces.archive({ premisesId, bedspaceId }),
        'bedspaceArchive',
      )
    })

    it('handles multiple validation errors in API response', async () => {
      const params = { premisesId, bedspaceId }

      request = createMock<Request>({
        session: {
          probationRegion: probationRegionFactory.build(),
        },
        params,
        body: {
          archiveOption: 'anotherDate',
          'archiveDate-day': '25',
          'archiveDate-month': '7',
          'archiveDate-year': '2025',
        },
      })

      const error = {
        status: 400,
        data: {
          'invalid-params': [
            {
              propertyName: '$.endDate',
              errorType: 'existingBookings',
              errorDetail: null as never,
            },
            {
              propertyName: '$.endDate',
              errorType: 'existingVoid',
              errorDetail: null as never,
            },
          ],
        },
      }

      bedspaceService.archiveBedspace.mockRejectedValue(error)

      const requestHandler = bedspacesController.archiveSubmit()
      await requestHandler(request, response, next)

      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        error,
        paths.premises.v2.bedspaces.archive({ premisesId, bedspaceId }),
        'bedspaceArchive',
      )
    })

    it('handles API error without invalid-params structure', async () => {
      const params = { premisesId, bedspaceId }

      request = createMock<Request>({
        session: {
          probationRegion: probationRegionFactory.build(),
        },
        params,
        body: {
          archiveOption: 'today',
        },
      })

      const error = {
        status: 500,
        data: {
          message: 'Internal server error',
        },
      }

      bedspaceService.archiveBedspace.mockRejectedValue(error)

      const requestHandler = bedspacesController.archiveSubmit()
      await requestHandler(request, response, next)

      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        error,
        paths.premises.v2.bedspaces.archive({ premisesId, bedspaceId }),
        'bedspaceArchive',
      )
    })
  })
})
