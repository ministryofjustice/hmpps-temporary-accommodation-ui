import { DeepMocked, createMock } from '@golevelup/ts-jest'
import { NextFunction, Request, Response } from 'express'
import { Cas3Bedspace } from '@approved-premises/api'
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

      await requestHandler(request, response, next)

      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        err,
        paths.premises.v2.bedspaces.new({ premisesId }),
      )
    })
  })

  describe('show', () => {
    const bedspaceId = 'some-bedspace-id'

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

    it.each([
      [onlineBedspace, onlineBedspaceSummary],
      [archivedBedspace, archivedBedspaceSummary],
      [upcomingBedspace, upcomingBedspaceSummary],
    ])('should return a bedspace', async (bedspace: Cas3Bedspace, summary: SummaryList) => {
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
        actions: [
          {
            text: 'Edit bedspace details',
            classes: 'govuk-button--secondary',
            href: paths.premises.v2.bedspaces.edit({ premisesId, bedspaceId }),
          },
        ],
      })

      expect(premisesService.getSinglePremisesDetails).toHaveBeenCalledWith(callConfig, premisesId)
      expect(bedspaceService.getSingleBedspace).toHaveBeenCalledWith(callConfig, premisesId, bedspaceId)
      expect(bedspaceService.summaryList).toHaveBeenCalledWith(bedspace)
    })
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
        paths.premises.v2.bedspaces.show({ premisesId: premises.id, bedspaceId: bedspace.id }),
      )
    })

    it('should fail to update a bedspace when the service returns an error', async () => {
      const requestHandler = bedspacesController.update()

      const bedspaceId = '8d6f6436-bda4-4d58-a2bc-72d3d2e41134'
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
})
