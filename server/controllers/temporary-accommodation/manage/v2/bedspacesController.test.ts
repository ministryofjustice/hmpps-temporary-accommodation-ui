import { DeepMocked, createMock } from '@golevelup/ts-jest'
import { NextFunction, Request, Response } from 'express'
import { Cas3Bedspace, Cas3PremisesBedspaceTotals } from '@approved-premises/api'
import { ErrorsAndUserInput, SummaryList } from '@approved-premises/ui'
import { CallConfig } from '../../../../data/restClient'
import BedspaceService from '../../../../services/v2/bedspaceService'
import BedspacesController from './bedspacesController'
import {
  assessmentFactory,
  bookingFactory,
  cas3BedspaceFactory,
  cas3BedspacesFactory,
  cas3PremisesFactory,
  cas3UpdateBedspaceFactory,
  characteristicFactory,
  lostBedFactory,
  placeContextFactory,
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
import { AssessmentsService, BookingService } from '../../../../services'
import { ListingEntry } from '../../../../services/bookingService'

jest.mock('../../../../utils/validation')
jest.mock('../../../../utils/restUtils')

describe('BedspacesController', () => {
  const callConfig = { token: 'some-call-config-token' } as CallConfig
  const premisesId = 'some-premises-id'
  const bedspaceId = 'some-bedspace-id'
  const bookingId = 'some-booking-id'
  const lostBedId = 'some-lost-bed-id'

  const referenceData = {
    characteristics: referenceDataFactory.characteristic('room').buildList(5),
  }
  const assessment = assessmentFactory.build({ status: 'ready_to_place' })
  const placeContext = placeContextFactory.build({ assessment })

  let request: Request

  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const bedspaceService = createMock<BedspaceService>({})
  const premisesService = createMock<PremisesService>({})
  const bookingService = createMock<BookingService>({})
  const assessmentService = createMock<AssessmentsService>({})

  const bedspacesController = new BedspacesController(
    premisesService,
    bedspaceService,
    bookingService,
    assessmentService,
  )

  beforeEach(() => {
    jest.clearAllMocks()
    request = createMock<Request>({
      session: {
        probationRegion: probationRegionFactory.build(),
      },
      query: {
        placeContextAssessmentId: placeContext.assessment.id,
        placeContextArrivalDate: placeContext.arrivalDate,
      },
    })
    ;(extractCallConfig as jest.MockedFn<typeof extractCallConfig>).mockReturnValue(callConfig)
    ;(generateMergeParameters as jest.Mock).mockReturnValue(undefined)
    assessmentService.findAssessment.mockResolvedValue(assessment)
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
        paths.premises.bedspaces.show({ premisesId, bedspaceId: bedspace.id }),
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
        paths.premises.bedspaces.new({ premisesId }),
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
        href: `${paths.bookings.new({ premisesId, bedspaceId })}?placeContextAssessmentId=${placeContext.assessment.id}&placeContextArrivalDate=${placeContext.arrivalDate}`,
        classes: 'govuk-button--secondary',
      },
      {
        text: 'Void bedspace',
        href: paths.lostBeds.new({ premisesId, bedspaceId }),
        classes: 'govuk-button--secondary',
      },
      {
        text: 'Archive bedspace',
        href: paths.premises.bedspaces.archive({ premisesId, bedspaceId }),
        classes: 'govuk-button--secondary',
      },
      {
        text: 'Edit bedspace details',
        href: paths.premises.bedspaces.edit({ premisesId, bedspaceId }),
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
        href: paths.premises.bedspaces.unarchive({ premisesId, bedspaceId }),
        classes: 'govuk-button--secondary',
      },
      {
        text: 'Edit bedspace details',
        href: paths.premises.bedspaces.edit({ premisesId, bedspaceId }),
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
      // {
      //   text: 'Cancel scheduled bedspace online date',
      //   href: paths.premises.bedspaces.cancelArchive({ premisesId, bedspaceId }),
      //   classes: 'govuk-button--secondary',
      // },
      {
        text: 'Edit bedspace details',
        href: paths.premises.bedspaces.edit({ premisesId, bedspaceId }),
        classes: 'govuk-button--secondary',
      },
    ]
    const bookingEntry = {
      body: bookingFactory.build({ id: bookingId }),
      type: 'booking',
      path: paths.bookings.show({ premisesId, bedspaceId, bookingId }),
    }
    const lostBedEntry = {
      body: lostBedFactory.build({ id: lostBedId }),
      type: 'lost-bed',
      path: paths.lostBeds.show({ premisesId, bedspaceId, lostBedId }),
    }
    it.each([
      [onlineBedspace, onlineBedspaceSummary, onlineBedspaceActions, [bookingEntry, lostBedEntry]],
      [archivedBedspace, archivedBedspaceSummary, archivedBedspaceActions, []],
      [upcomingBedspace, upcomingBedspaceSummary, upcomingBedspaceActions, []],
    ])(
      'should return a bedspace',
      async (bedspace: Cas3Bedspace, summary: SummaryList, actions: [], bookingsAndLostBeds: Array<ListingEntry>) => {
        const params = { premisesId, bedspaceId }

        premisesService.getSinglePremisesDetails.mockResolvedValue(premisesWithFullAddress)
        bedspaceService.getSingleBedspace.mockResolvedValue(bedspace)
        bedspaceService.summaryList.mockReturnValue(summary)
        bookingService.getListingEntries.mockResolvedValue(bookingsAndLostBeds)

        request = createMock<Request>({
          session: {
            probationRegion: probationRegionFactory.build(),
          },
          params,
          query: {
            placeContextAssessmentId: placeContext.assessment.id,
            placeContextArrivalDate: placeContext.arrivalDate,
          },
        })

        const requestHandler = bedspacesController.show()
        await requestHandler(request, response, next)

        expect(response.render).toHaveBeenCalledWith('temporary-accommodation/v2/bedspaces/show', {
          premises: premisesWithFullAddress,
          summary,
          bedspace,
          actions,
          listingEntries: bookingsAndLostBeds,
        })

        expect(premisesService.getSinglePremisesDetails).toHaveBeenCalledWith(callConfig, premisesId)
        expect(bedspaceService.getSingleBedspace).toHaveBeenCalledWith(callConfig, premisesId, bedspaceId)
        expect(bedspaceService.summaryList).toHaveBeenCalledWith(bedspace)
        expect(bookingService.getListingEntries).toHaveBeenCalledWith(callConfig, premisesId, bedspaceId)
      },
    )
  })

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
        paths.premises.bedspaces.show({ premisesId: premises.id, bedspaceId: bedspace.id }),
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
        paths.premises.bedspaces.edit({ premisesId, bedspaceId }),
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
      expect(response.redirect).toHaveBeenCalledWith(paths.premises.bedspaces.show({ premisesId, bedspaceId }))
    })

    it('redirects to the bedspace page without cancelling if "no" is selected', async () => {
      request.body = { bedspaceId: 'no' }

      await requestHandler(request, response, next)

      expect(bedspaceService.cancelArchiveBedspace).not.toHaveBeenCalled()
      expect(request.flash).not.toHaveBeenCalledWith('success', 'Bedspace archive cancelled')
      expect(response.redirect).toHaveBeenCalledWith(paths.premises.bedspaces.show({ premisesId, bedspaceId }))
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
        paths.premises.bedspaces.cancelArchive({ premisesId, bedspaceId }),
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
    it('renders the archive form when bedspace can be archived', async () => {
      const bedspace = cas3BedspaceFactory.build()
      const premises = cas3PremisesFactory.build()
      const canArchiveResponse = {}
      const params = { premisesId, bedspaceId }

      bedspaceService.getSingleBedspace.mockResolvedValue(bedspace)
      premisesService.getSinglePremises.mockResolvedValue(premises)
      bedspaceService.canArchiveBedspace.mockResolvedValue(canArchiveResponse)
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
      expect(premisesService.getSinglePremises).toHaveBeenCalledWith(callConfig, premisesId)
      expect(bedspaceService.canArchiveBedspace).toHaveBeenCalledWith(callConfig, premisesId, bedspaceId)
      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/v2/bedspaces/archive', {
        bedspace,
        params,
        errors: {},
        errorSummary: [],
        archiveOption: 'today',
      })
    })

    it('renders the cannot-archive page when bedspace has blocking date', async () => {
      const bedspace = cas3BedspaceFactory.build()
      const premises = cas3PremisesFactory.build()
      const canArchiveResponse = { date: '2025-08-28', entityId: 'some-id', entityReference: 'some-ref' }
      const params = { premisesId, bedspaceId }

      bedspaceService.getSingleBedspace.mockResolvedValue(bedspace)
      premisesService.getSinglePremises.mockResolvedValue(premises)
      bedspaceService.canArchiveBedspace.mockResolvedValue(canArchiveResponse)
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
      expect(premisesService.getSinglePremises).toHaveBeenCalledWith(callConfig, premisesId)
      expect(bedspaceService.canArchiveBedspace).toHaveBeenCalledWith(callConfig, premisesId, bedspaceId)
      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/v2/bedspaces/cannot-archive', {
        bedspace,
        premises,
        blockingDate: '28 August 2025',
        params,
      })
    })
  })

  describe('archiveSubmit', () => {
    it('successfully archives a bedspace and redirects to show page when not last bedspace', async () => {
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

      const allBedspaces = cas3BedspacesFactory.build({
        bedspaces: [
          cas3BedspaceFactory.build({ id: bedspaceId, status: 'online' }),
          cas3BedspaceFactory.build({ id: 'other-bedspace', status: 'online' }),
        ],
        totalOnlineBedspaces: 2,
        totalArchivedBedspaces: 0,
        totalUpcomingBedspaces: 0,
      })
      bedspaceService.getBedspacesForPremises.mockResolvedValue(allBedspaces)
      bedspaceService.archiveBedspace.mockResolvedValue()

      const requestHandler = bedspacesController.archiveSubmit()
      await requestHandler(request, response, next)

      expect(bedspaceService.getBedspacesForPremises).toHaveBeenCalledWith(callConfig, premisesId)
      expect(bedspaceService.archiveBedspace).toHaveBeenCalledWith(
        callConfig,
        premisesId,
        bedspaceId,
        expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/), // Today's date in ISO format
      )

      expect(request.flash).toHaveBeenCalledWith('success', 'Bedspace archived')
      expect(response.redirect).toHaveBeenCalledWith(paths.premises.bedspaces.show({ premisesId, bedspaceId }))
    })

    it('successfully archives the last bedspace and redirects to show page with archived property message', async () => {
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

      const allBedspaces = cas3BedspacesFactory.build({
        bedspaces: [
          cas3BedspaceFactory.build({ id: bedspaceId, status: 'online' }),
          cas3BedspaceFactory.build({ id: 'other-bedspace', status: 'archived' }),
        ],
        totalOnlineBedspaces: 1,
        totalArchivedBedspaces: 1,
        totalUpcomingBedspaces: 0,
      })
      bedspaceService.getBedspacesForPremises.mockResolvedValue(allBedspaces)
      bedspaceService.archiveBedspace.mockResolvedValue()

      const requestHandler = bedspacesController.archiveSubmit()
      await requestHandler(request, response, next)

      expect(bedspaceService.getBedspacesForPremises).toHaveBeenCalledWith(callConfig, premisesId)
      expect(bedspaceService.archiveBedspace).toHaveBeenCalledWith(
        callConfig,
        premisesId,
        bedspaceId,
        expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/), // Today's date in ISO format
      )
      expect(request.flash).toHaveBeenCalledWith('success', 'Bedspace and property archived')
      expect(response.redirect).toHaveBeenCalledWith(paths.premises.bedspaces.show({ premisesId, bedspaceId }))
    })

    it('should fail to archive when the service returns an error', async () => {
      request.params = { premisesId, bedspaceId }
      request.body = { archiveOption: 'today' }

      const earliestDate = new Date()
      earliestDate.setDate(earliestDate.getDate() + 7)

      const error = {
        data: {
          title: 'Bad Request',
          status: 400,
          detail: 'There is a problem with your request',
          'invalid-params': [
            {
              propertyName: '$.endDate',
              errorType: 'existingUpcomingBedspace',
              entityId: 'a094a15b-5ead-4c99-a20b-77aa15eb9ce6',
              value: DateFormats.dateObjToIsoDate(earliestDate),
            },
          ],
        },
      }

      const mergeParameters: Array<Record<string, Record<string, string>>> = []

      bedspaceService.archiveBedspace.mockImplementation(() => {
        throw error
      })
      ;(generateMergeParameters as jest.Mock).mockReturnValue(mergeParameters)

      const requestHandler = bedspacesController.archiveSubmit()

      await requestHandler(request, response, next)

      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        error,
        paths.premises.bedspaces.archive({ premisesId, bedspaceId }),
        'bedspaceArchive',
        mergeParameters,
      )

      expect(generateMergeParameters).toHaveBeenCalled()
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
        paths.premises.bedspaces.archive({ premisesId, bedspaceId }),
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
        paths.premises.bedspaces.archive({ premisesId, bedspaceId }),
        'bedspaceArchive',
        undefined,
      )
    })
  })

  describe('unarchive', () => {
    it('renders the unarchive page with bedspace details', async () => {
      const bedspace = cas3BedspaceFactory.build()
      bedspaceService.getSingleBedspace.mockResolvedValue(bedspace)

      request = createMock<Request>({
        params: { premisesId, bedspaceId },
        session: {
          probationRegion: probationRegionFactory.build(),
        },
      })

      const requestHandler = bedspacesController.unarchive()
      await requestHandler(request, response, next)

      expect(bedspaceService.getSingleBedspace).toHaveBeenCalledWith(callConfig, premisesId, bedspaceId)
      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/v2/bedspaces/unarchive', {
        bedspace,
        params: request.params,
        errors: {},
        errorSummary: [],
        unarchiveOption: 'today',
      })
    })
  })

  describe('unarchiveSubmit', () => {
    it('successfully unarchives a bedspace and redirects to show page when not last archived bedspace', async () => {
      const params = { premisesId, bedspaceId }

      request = createMock<Request>({
        session: {
          probationRegion: probationRegionFactory.build(),
        },
        params,
        body: {
          unarchiveOption: 'today',
        },
      })

      const otherArchivedBedspace = cas3BedspaceFactory.build({ status: 'archived' })
      const bedspacesList = cas3BedspacesFactory.build({
        bedspaces: [cas3BedspaceFactory.build({ id: bedspaceId, status: 'archived' }), otherArchivedBedspace],
      })

      bedspaceService.getBedspacesForPremises.mockResolvedValue(bedspacesList)
      bedspaceService.unarchiveBedspace.mockResolvedValue()

      const requestHandler = bedspacesController.unarchiveSubmit()
      await requestHandler(request, response, next)

      expect(bedspaceService.getBedspacesForPremises).toHaveBeenCalledWith(callConfig, premisesId)
      expect(bedspaceService.unarchiveBedspace).toHaveBeenCalledWith(
        callConfig,
        premisesId,
        bedspaceId,
        expect.any(String),
      )
      expect(request.flash).toHaveBeenCalledWith('success', 'Bedspace online')
      expect(response.redirect).toHaveBeenCalledWith(paths.premises.bedspaces.show({ premisesId, bedspaceId }))
    })

    it('successfully unarchives the last archived bedspace and shows property message', async () => {
      const params = { premisesId, bedspaceId }

      request = createMock<Request>({
        session: {
          probationRegion: probationRegionFactory.build(),
        },
        params,
        body: {
          unarchiveOption: 'today',
        },
      })

      const bedspacesList = cas3BedspacesFactory.build({
        bedspaces: [
          cas3BedspaceFactory.build({ id: bedspaceId, status: 'archived' }),
          cas3BedspaceFactory.build({ status: 'online' }),
        ],
      })

      bedspaceService.getBedspacesForPremises.mockResolvedValue(bedspacesList)
      bedspaceService.unarchiveBedspace.mockResolvedValue()

      const requestHandler = bedspacesController.unarchiveSubmit()
      await requestHandler(request, response, next)

      expect(bedspaceService.getBedspacesForPremises).toHaveBeenCalledWith(callConfig, premisesId)
      expect(bedspaceService.unarchiveBedspace).toHaveBeenCalledWith(
        callConfig,
        premisesId,
        bedspaceId,
        expect.any(String),
      )
      expect(request.flash).toHaveBeenCalledWith('success', 'Bedspace and property online')
      expect(response.redirect).toHaveBeenCalledWith(paths.premises.bedspaces.show({ premisesId, bedspaceId }))
    })

    it('successfully unarchives the last archived bedspace with future date and shows property updated message', async () => {
      const params = { premisesId, bedspaceId }
      const futureDate = '2025-12-01'

      request = createMock<Request>({
        session: {
          probationRegion: probationRegionFactory.build(),
        },
        params,
        body: {
          unarchiveOption: 'other',
          'restartDate-day': '1',
          'restartDate-month': '12',
          'restartDate-year': '2025',
        },
      })

      const bedspacesList = cas3BedspacesFactory.build({
        bedspaces: [
          cas3BedspaceFactory.build({ id: bedspaceId, status: 'archived' }),
          cas3BedspaceFactory.build({ status: 'online' }),
        ],
      })

      bedspaceService.getBedspacesForPremises.mockResolvedValue(bedspacesList)
      bedspaceService.unarchiveBedspace.mockResolvedValue()

      const requestHandler = bedspacesController.unarchiveSubmit()
      await requestHandler(request, response, next)

      expect(bedspaceService.getBedspacesForPremises).toHaveBeenCalledWith(callConfig, premisesId)
      expect(bedspaceService.unarchiveBedspace).toHaveBeenCalledWith(callConfig, premisesId, bedspaceId, futureDate)
      expect(request.flash).toHaveBeenCalledWith('success', 'Bedspace and property updated')
      expect(response.redirect).toHaveBeenCalledWith(paths.premises.bedspaces.show({ premisesId, bedspaceId }))
    })
  })
})
