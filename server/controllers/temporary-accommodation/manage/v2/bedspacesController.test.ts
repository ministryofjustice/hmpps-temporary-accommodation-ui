import { DeepMocked, createMock } from '@golevelup/ts-jest'
import { NextFunction, Request, Response } from 'express'
import { Cas3Bedspace, Cas3PremisesBedspaceTotals } from '@approved-premises/api'
import { ErrorsAndUserInput, SummaryList } from '@approved-premises/ui'
import { CallConfig } from '../../../../data/restClient'
import BedspaceService from '../../../../services/v2/bedspaceService'
import BedspacesController from './bedspacesController'
import {
  cas3BedspaceFactory,
  cas3PremisesFactory,
  cas3UpdateBedspaceFactory,
  characteristicFactory,
  probationRegionFactory,
  referenceDataFactory,
} from '../../../../testutils/factories'
import {
  catchValidationErrorOrPropogate,
  fetchErrorsAndUserInput,
  generateMergeParameters,
} from '../../../../utils/validation'
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
    ;(generateMergeParameters as jest.Mock).mockReturnValue(undefined)
  })

  describe('new', () => {
    it('renders the form', async () => {
      const premises = cas3PremisesFactory.build()
      const today = new Date()
      const userInput = {
        'startDate-day': String(today.getDate()),
        'startDate-month': String(today.getMonth() + 1),
        'startDate-year': String(today.getFullYear()),
      }

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
        ...userInput,
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

      expect(request.flash).toHaveBeenCalledWith('success', 'Bedspace added')
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
      id: premisesId,
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
      id: bedspaceId,
      status: 'online',
      startDate: '2024-11-23',
      characteristics: [characteristic1, characteristic2],
    })
    const onlineBedspaceSummary: SummaryList = {
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
    }
    const onlineBedspaceActions = [
      {
        text: 'Book bedspace',
        href: paths.bookings.new({ premisesId, roomId: bedspaceId }),
        classes: 'govuk-button--secondary',
      },
      {
        text: 'Void bedspace',
        href: paths.lostBeds.new({ premisesId, roomId: bedspaceId }),
        classes: 'govuk-button--secondary',
      },
      {
        text: 'Archive bedspace',
        href: '/v2/properties/some-premises-id/bedspaces/some-bedspace-id/archive',
        classes: 'govuk-button--secondary',
      },
      {
        text: 'Edit bedspace details',
        href: paths.premises.v2.bedspaces.edit({ premisesId, bedspaceId }),
        classes: 'govuk-button--secondary',
      },
    ]
    const archivedBedspace = cas3BedspaceFactory.build({
      id: bedspaceId,
      status: 'archived',
      startDate: '2023-10-22',
      characteristics: [characteristic1],
    })
    const archivedBedspaceSummary: SummaryList = {
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
    }
    const archivedBedspaceActions = [
      {
        text: 'Make bedspace online',
        href: '#',
        classes: 'govuk-button--secondary',
      },
      {
        text: 'Edit bedspace details',
        href: paths.premises.v2.bedspaces.edit({ premisesId, bedspaceId }),
        classes: 'govuk-button--secondary',
      },
    ]
    const upcomingBedspace = cas3BedspaceFactory.build({
      id: bedspaceId,
      status: 'upcoming',
      startDate: '2025-09-21',
      characteristics: [characteristic2],
    })
    const upcomingBedspaceSummary: SummaryList = {
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
    }
    const upcomingBedspaceActions = [
      {
        text: 'Cancel scheduled bedspace online date',
        href: paths.premises.v2.bedspaces.cancelArchive({ premisesId, bedspaceId }),
        classes: 'govuk-button--secondary',
      },
      {
        text: 'Edit bedspace details',
        href: paths.premises.v2.bedspaces.edit({ premisesId, bedspaceId }),
        classes: 'govuk-button--secondary',
      },
    ]
    it.each([
      [onlineBedspace, onlineBedspaceSummary, onlineBedspaceActions],
      [archivedBedspace, archivedBedspaceSummary, archivedBedspaceActions],
      [upcomingBedspace, upcomingBedspaceSummary, upcomingBedspaceActions],
    ])('should return a bedspace', async (bedspace: Cas3Bedspace, summary: SummaryList, actions: []) => {
      const params = { premisesId, bedspaceId }

      premisesService.getSinglePremisesDetails.mockResolvedValue(premisesWithFullAddress)
      bedspaceService.getSingleBedspace.mockResolvedValue(bedspace)
      bedspaceService.summaryList.mockReturnValue(summary)

      request = createMock<Request>({
        session: {
          probationRegion: probationRegionFactory.build(),
        },
        params,
      })

      const requestHandler = bedspacesController.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/v2/bedspaces/show', {
        premises: premisesWithFullAddress,
        summary,
        bedspace,
        actions,
      })

      expect(premisesService.getSinglePremisesDetails).toHaveBeenCalledWith(callConfig, premisesId)
      expect(bedspaceService.getSingleBedspace).toHaveBeenCalledWith(callConfig, premisesId, bedspaceId)
      expect(bedspaceService.summaryList).toHaveBeenCalledWith(bedspace)
    })
  })

  // const expectedActions =
  //   bedspace.status === 'archived'
  //     ? []
  //     : [
  //       {
  //         text: 'Archive',
  //         classes: 'govuk-button--secondary moj-button-menu__item',
  //         href: paths.premises.v2.bedspaces.archive({ premisesId, bedspaceId }),
  //       },
  //     ]
  //
  // expect(response.render).toHaveBeenCalledWith('temporary-accommodation/v2/bedspaces/show', {
  //   premises: premisesWithFullAddress,
  //   bedspace,
  //   actions: expectedActions,
  // })

  describe('edit', () => {
    const premises = cas3PremisesFactory.build({ status: 'online' })
    const bedspace = cas3BedspaceFactory.build({ status: 'online' })

    const summaryList: SummaryList = {
      rows: [
        {
          key: { text: 'Status' },
          value: { html: `<strong class="govuk-tag govuk-tag--green">Online</strong>` },
        },
        {
          key: { text: 'Address' },
          value: {
            html: `${premises.addressLine1}<br />${premises.addressLine2}<br />${premises.town}<br />${premises.postcode}`,
          },
        },
      ],
    }

    it('should render the form', async () => {
      premisesService.getSinglePremises.mockResolvedValue(premises)
      premisesService.shortSummaryList.mockReturnValue(summaryList)
      bedspaceService.getSingleBedspace.mockResolvedValue(bedspace)
      bedspaceService.getReferenceData.mockResolvedValue(referenceData)
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({ errors: {}, errorSummary: [], userInput: {} })

      const requestHandler = bedspacesController.edit()

      request.params = { premisesId: premises.id, bedspaceId: bedspace.id }

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/v2/bedspaces/edit', {
        premisesId: premises.id,
        bedspaceId: bedspace.id,
        summary: summaryList,
        errors: {},
        errorSummary: [],
        characteristics: referenceData.characteristics.filter(ch => ch.propertyName !== 'other'),
        reference: bedspace.reference,
        notes: bedspace.notes,
        characteristicIds: bedspace.characteristics.map(ch => ch.id),
      })

      expect(premisesService.getSinglePremises).toHaveBeenCalledWith(callConfig, premises.id)
      expect(premisesService.shortSummaryList).toHaveBeenCalledWith(premises)
      expect(bedspaceService.getSingleBedspace).toHaveBeenCalledWith(callConfig, premises.id, bedspace.id)
      expect(bedspaceService.getReferenceData).toHaveBeenCalledWith(callConfig)
    })

    it('should render the form with errors and user input when the backend returns an error', async () => {
      premisesService.getSinglePremises.mockResolvedValue(premises)
      premisesService.shortSummaryList.mockReturnValue(summaryList)
      bedspaceService.getSingleBedspace.mockResolvedValue(bedspace)
      bedspaceService.getReferenceData.mockResolvedValue(referenceData)

      const errorsAndUserInput = createMock<ErrorsAndUserInput>()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue(errorsAndUserInput)

      request.params = { premisesId: premises.id, bedspaceId: bedspace.id }

      const requestHandler = bedspacesController.edit()

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/v2/bedspaces/edit', {
        premisesId: premises.id,
        bedspaceId: bedspace.id,
        summary: summaryList,
        errors: errorsAndUserInput.errors,
        errorSummary: errorsAndUserInput.errorSummary,
        characteristics: referenceData.characteristics.filter(ch => ch.propertyName !== 'other'),
        ...errorsAndUserInput.userInput,
        reference: bedspace.reference,
        notes: bedspace.notes,
        characteristicIds: bedspace.characteristics.map(ch => ch.id),
      })

      expect(premisesService.getSinglePremises).toHaveBeenCalledWith(callConfig, premises.id)
      expect(premisesService.shortSummaryList).toHaveBeenCalledWith(premises)
      expect(bedspaceService.getSingleBedspace).toHaveBeenCalledWith(callConfig, premises.id, bedspace.id)
      expect(bedspaceService.getReferenceData).toHaveBeenCalledWith(callConfig)
    })
  })

  describe('update', () => {
    it('should successfully update a bedspace and redirect to the show bedspace page', async () => {
      const requestHandler = bedspacesController.update()

      const premises = cas3PremisesFactory.build()
      const bedspace = cas3BedspaceFactory.build()
      const updatedBedspace = cas3UpdateBedspaceFactory.build()

      request.params = { premisesId: premises.id, bedspaceId: bedspace.id }

      request.body = { ...updatedBedspace }

      bedspaceService.updateBedspace.mockResolvedValue(bedspace)

      await requestHandler(request, response, next)

      expect(bedspaceService.updateBedspace).toHaveBeenCalledWith(callConfig, premises.id, bedspace.id, {
        ...updatedBedspace,
      })
      expect(request.flash).toHaveBeenCalledWith('success', 'Bedspace edited')
      expect(response.redirect).toHaveBeenCalledWith(
        paths.premises.v2.bedspaces.show({ premisesId: premises.id, bedspaceId: bedspace.id }),
      )
    })

    it('should fail to update a bedspace when the service returns an error', async () => {
      const requestHandler = bedspacesController.update()

      const updatedBedspace = cas3UpdateBedspaceFactory.build()

      request.params = { premisesId, bedspaceId }

      request.body = {
        ...updatedBedspace,
        reference: '',
      }

      const err = {
        data: {
          title: 'Bad Request',
          status: 400,
          detail: 'There is a problem with your request',
          'invalid-params': [{ propertyName: '$.reference', errorType: 'empty' }],
        },
      }

      bedspaceService.updateBedspace.mockImplementation(() => {
        throw err
      })

      await requestHandler(request, response, next)

      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        err,
        paths.premises.v2.bedspaces.edit({ premisesId, bedspaceId }),
      )
    })
  })

  describe('submitCancelArchive', () => {
    let requestHandler: ReturnType<BedspacesController['submitCancelArchive']>

    beforeEach(() => {
      requestHandler = bedspacesController.submitCancelArchive()
      request.params = { premisesId, bedspaceId }
    })

    it('cancels the archive and redirects to bedspace page with a success message when "yes" is selected', async () => {
      request.body = { bedspaceId: 'yes' }
      bedspaceService.cancelArchiveBedspace.mockResolvedValue(undefined)

      await requestHandler(request, response, next)

      expect(bedspaceService.cancelArchiveBedspace).toHaveBeenCalledWith(callConfig, premisesId, bedspaceId)
      expect(request.flash).toHaveBeenCalledWith('success', 'Bedspace archive cancelled')
      expect(response.redirect).toHaveBeenCalledWith(paths.premises.v2.bedspaces.show({ premisesId, bedspaceId }))
    })

    it('redirects to the bedspace page without cancelling if "no" is selected', async () => {
      request.body = { bedspaceId: 'no' }

      await requestHandler(request, response, next)

      expect(bedspaceService.cancelArchiveBedspace).not.toHaveBeenCalled()
      expect(request.flash).not.toHaveBeenCalledWith('success', 'Bedspace archive cancelled')
      expect(response.redirect).toHaveBeenCalledWith(paths.premises.v2.bedspaces.show({ premisesId, bedspaceId }))
    })

    it('renders the cancel archive page with errors when the service throws', async () => {
      const error = new Error('error')
      request.body = { bedspaceId: 'yes' }
      bedspaceService.cancelArchiveBedspace.mockRejectedValue(error)

      await requestHandler(request, response, next)

      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        error,
        paths.premises.v2.bedspaces.cancelArchive({ premisesId, bedspaceId }),
      )
    })
  })

  describe('cancelArchive', () => {
    const bedspace = cas3BedspaceFactory.build({ endDate: '2025-12-31' })

    beforeEach(() => {
      request.params = { premisesId, bedspaceId }
      bedspaceService.getSingleBedspace.mockResolvedValue(bedspace)
      premisesService.getSinglePremisesBedspaceTotals.mockResolvedValue({
        status: 'online',
      } as Cas3PremisesBedspaceTotals)
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({ errors: {}, errorSummary: [] })
    })

    it('renders the cancel archive page with the correct data', async () => {
      const requestHandler = bedspacesController.cancelArchive()
      await requestHandler(request, response, next)

      expect(bedspaceService.getSingleBedspace).toHaveBeenCalledWith(callConfig, premisesId, bedspaceId)
      expect(premisesService.getSinglePremisesBedspaceTotals).toHaveBeenCalledWith(callConfig, premisesId)
      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/v2/bedspaces/cancel-archive', {
        premisesId,
        bedspaceId,
        bedspaceEndDate: DateFormats.isoDateToUIDate(bedspace.endDate),
        scheduledForArchive: false,
        errors: {},
        errorSummary: [],
      })
    })

    it('renders the cancel archive page with errors and errorSummary when the backend returns errors', async () => {
      const errorsAndUserInput = createMock<ErrorsAndUserInput>({
        errors: {
          bedspaceId: { text: 'This bedspace is not scheduled to be archived' },
        },
        errorSummary: [{ text: 'This bedspace is not scheduled to be archived', href: '#bedspaceId' }],
      })
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue(errorsAndUserInput)

      const requestHandler = bedspacesController.cancelArchive()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/v2/bedspaces/cancel-archive', {
        premisesId,
        bedspaceId,
        bedspaceEndDate: DateFormats.isoDateToUIDate(bedspace.endDate),
        scheduledForArchive: false,
        errors: errorsAndUserInput.errors,
        errorSummary: errorsAndUserInput.errorSummary,
      })
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

      bedspaceService.getSingleBedspace.mockResolvedValue(bedspaceWithSummary)
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({ errors: {}, errorSummary: [], userInput: {} })

      request = createMock<Request>({
        session: {
          probationRegion: probationRegionFactory.build(),
        },
        params,
      })

      const requestHandler = bedspacesController.archive()
      await requestHandler(request, response, next)

      expect(bedspaceService.getSingleBedspace).toHaveBeenCalledWith(callConfig, premisesId, bedspaceId)
      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/v2/bedspaces/archive', {
        bedspace: bedspaceWithSummary,
        params,
        errors: {},
        errorSummary: [],
        archiveOption: 'today',
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
        undefined,
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
          'endDate-day': '25',
          'endDate-month': '7',
          'endDate-year': '2025',
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
        undefined,
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
          'endDate-day': '25',
          'endDate-month': '7',
          'endDate-year': '2025',
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
        undefined,
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
          'endDate-day': '25',
          'endDate-month': '7',
          'endDate-year': '2025',
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
        undefined,
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
          'endDate-day': '17',
          'endDate-month': '7',
          'endDate-year': '2025',
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
        undefined,
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
          'endDate-day': '25',
          'endDate-month': '12',
          'endDate-year': '2025',
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
        undefined,
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
          'endDate-day': '25',
          'endDate-month': '7',
          'endDate-year': '2025',
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
        undefined,
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
        undefined,
      )
    })
  })
})
