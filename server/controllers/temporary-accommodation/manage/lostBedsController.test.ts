import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import { BespokeError } from '../../../@types/ui'
import { CallConfig } from '../../../data/restClient'
import paths from '../../../paths/temporary-accommodation/manage'
import { AssessmentsService, LostBedService, PremisesService } from '../../../services'
import BedspaceService from '../../../services/v2/bedspaceService'
import {
  cas3BedspaceFactory,
  lostBedCancellationFactory,
  lostBedFactory,
  newLostBedCancellationFactory,
  newLostBedFactory,
  premisesFactory,
  referenceDataFactory,
  updateLostBedFactory,
} from '../../../testutils/factories'
import { generateConflictBespokeError } from '../../../utils/bookingUtils'
import { DateFormats } from '../../../utils/dateUtils'
import { allStatuses, lostBedActions } from '../../../utils/lostBedUtils'
import { preservePlaceContext } from '../../../utils/placeUtils'
import extractCallConfig from '../../../utils/restUtils'
import {
  catchValidationErrorOrPropogate,
  fetchErrorsAndUserInput,
  insertBespokeError,
  insertGenericError,
} from '../../../utils/validation'
import LostBedsController from './lostBedsController'

jest.mock('../../../utils/restUtils')
jest.mock('../../../utils/validation')
jest.mock('../../../utils/lostBedUtils')
jest.mock('../../../utils/bookingUtils')
jest.mock('../../../utils/placeUtils')

describe('LostBedsController', () => {
  const callConfig = { token: 'some-call-config-token' } as CallConfig
  const premisesId = 'premisesId'
  const bedspaceId = 'bedspaceId'
  const lostBedId = 'lostBedId'

  let request: Request

  let response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const lostBedService = createMock<LostBedService>({})
  const premisesService = createMock<PremisesService>({})
  const bedspaceService = createMock<BedspaceService>({})
  const assessmentService = createMock<AssessmentsService>({})

  const lostBedsController = new LostBedsController(lostBedService, premisesService, bedspaceService, assessmentService)

  beforeEach(() => {
    request = createMock<Request>()
    response = createMock<Response>({})
    ;(extractCallConfig as jest.MockedFn<typeof extractCallConfig>).mockReturnValue(callConfig)
  })

  describe('new', () => {
    it('renders the form', async () => {
      request.params = {
        premisesId,
        bedspaceId,
      }

      const premises = premisesFactory.build()
      const bedspace = cas3BedspaceFactory.build()

      premisesService.getPremises.mockResolvedValue(premises)
      bedspaceService.getSingleBedspace.mockResolvedValue(bedspace)

      const requestHandler = lostBedsController.new()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({ errors: {}, errorSummary: [], userInput: {} })

      await requestHandler(request, response, next)

      expect(premisesService.getPremises).toHaveBeenCalledWith(callConfig, premisesId)
      expect(bedspaceService.getSingleBedspace).toHaveBeenCalledWith(callConfig, premisesId, bedspaceId)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/lost-beds/new', {
        premises,
        bedspace,
        errors: {},
        errorSummary: [],
      })
    })

    describe('create', () => {
      it('creates a lost bed and redirects to the show lost bed page', async () => {
        const requestHandler = lostBedsController.create()

        const lostBed = lostBedFactory.build()
        const newLostBed = newLostBedFactory.build({ ...lostBed, reason: lostBed.reason.id })

        lostBedService.create.mockResolvedValue(lostBed)

        request.params = {
          premisesId,
          bedspaceId,
        }

        request.body = {
          ...newLostBed,
          ...DateFormats.isoToDateAndTimeInputs(lostBed.startDate, 'startDate'),
          ...DateFormats.isoToDateAndTimeInputs(lostBed.endDate, 'endDate'),
        }

        await requestHandler(request, response, next)

        expect(lostBedService.create).toHaveBeenCalledWith(callConfig, premisesId, expect.objectContaining(newLostBed))

        expect(request.flash).toHaveBeenCalledWith('success', 'Void created')
        expect(response.redirect).toHaveBeenCalledWith(
          paths.lostBeds.show({ premisesId, bedspaceId, lostBedId: lostBed.id }),
        )
      })

      it('renders with errors if the API returns an error', async () => {
        const requestHandler = lostBedsController.create()

        const err = {}
        lostBedService.create.mockImplementation(() => {
          throw err
        })

        request.params = {
          premisesId,
          bedspaceId,
        }

        request.body = {
          costCentre: 'HMPPS',
          reason: 'some-reason',
          notes: 'some notes',
        }

        await requestHandler(request, response, next)

        expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
          request,
          response,
          err,
          paths.lostBeds.new({ premisesId, bedspaceId }),
        )
      })

      it('renders with errors if the API returns a 409 Conflict status', async () => {
        const requestHandler = lostBedsController.create()

        const err = { status: 409 }
        lostBedService.create.mockImplementation(() => {
          throw err
        })

        const bespokeError: BespokeError = {
          errorTitle: 'some-bespoke-error',
          errorSummary: [],
        }
        ;(generateConflictBespokeError as jest.MockedFunction<typeof generateConflictBespokeError>).mockReturnValue(
          bespokeError,
        )

        request.params = {
          premisesId,
          bedspaceId,
        }

        request.body = {
          costCentre: 'HMPPS',
          reason: 'some-reason',
          notes: 'some notes',
        }

        await requestHandler(request, response, next)

        expect(generateConflictBespokeError).toHaveBeenCalledWith(err, premisesId, bedspaceId, 'plural')
        expect(insertBespokeError).toHaveBeenCalledWith(err, bespokeError)
        expect(insertGenericError).toHaveBeenCalledWith(err, 'startDate', 'conflict')
        expect(insertGenericError).toHaveBeenCalledWith(err, 'endDate', 'conflict')
        expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
          request,
          response,
          err,
          paths.lostBeds.new({ premisesId, bedspaceId }),
        )
      })
    })

    describe('show', () => {
      it('renders the template for viewing a lost bed', async () => {
        const premises = premisesFactory.build()
        const bedspace = cas3BedspaceFactory.build()
        const lostBed = lostBedFactory.build()
        const mockActions = [{ classes: 'mock', href: '', text: 'mock' }]

        premisesService.getPremises.mockResolvedValue(premises)
        bedspaceService.getSingleBedspace.mockResolvedValue(bedspace)
        lostBedService.find.mockResolvedValue(lostBed)
        ;(lostBedActions as jest.MockedFn<typeof lostBedActions>).mockReturnValue(mockActions)

        request.params = {
          premisesId: premises.id,
          bedspaceId: bedspace.id,
          lostBedId: lostBed.id,
        }

        const requestHandler = lostBedsController.show()
        await requestHandler(request, response, next)

        expect(response.render).toHaveBeenCalledWith('temporary-accommodation/lost-beds/show', {
          premises,
          bedspace,
          lostBed,
          actions: mockActions,
          allStatuses,
        })
        expect(preservePlaceContext).toHaveBeenCalledWith(request, response, assessmentService)
      })
    })

    describe('update', () => {
      it('updates a lostBed and redirects to the show lostBed page', async () => {
        const premises = premisesFactory.build()
        const bedspace = cas3BedspaceFactory.build()
        const lostBed = lostBedFactory.build()
        const lostBedUpdate = updateLostBedFactory.build({ ...lostBed, reason: lostBed.reason.id })

        request.params.premisesId = premises.id
        request.params.bedspaceId = bedspace.id
        request.params.lostBedId = lostBed.id
        request.body = {
          ...lostBedUpdate,
          ...DateFormats.isoToDateAndTimeInputs(lostBedUpdate.startDate, 'startDate'),
          ...DateFormats.isoToDateAndTimeInputs(lostBedUpdate.endDate, 'endDate'),
        }

        const requestHandler = lostBedsController.update()
        lostBedService.update.mockResolvedValue(lostBed)

        await requestHandler(request, response, next)

        expect(lostBedService.update).toHaveBeenCalledWith(
          callConfig,
          premises.id,
          lostBed.id,
          expect.objectContaining(lostBedUpdate),
        )

        expect(request.flash).toHaveBeenCalledWith('success', 'Void booking updated')
        expect(response.redirect).toHaveBeenCalledWith(
          paths.lostBeds.show({ premisesId: premises.id, bedspaceId: bedspace.id, lostBedId: lostBed.id }),
        )
      })

      it('renders with errors if the API returns an error', async () => {
        const requestHandler = lostBedsController.update()

        request.params = {
          premisesId,
          bedspaceId,
          lostBedId,
        }

        request.body = {
          costCentre: 'HMPPS',
          reason: 'some-reason',
          notes: 'some notes',
        }

        const err = new Error()

        lostBedService.update.mockImplementation(() => {
          throw err
        })

        await requestHandler(request, response, next)

        expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
          request,
          response,
          err,
          paths.lostBeds.edit({ premisesId, bedspaceId, lostBedId }),
        )
      })

      it('renders with errors if the API returns a 409 Conflict status', async () => {
        const requestHandler = lostBedsController.update()

        request.params = {
          premisesId,
          bedspaceId,
          lostBedId,
        }

        request.body = {
          costCentre: 'HMPPS',
          reason: 'some-reason',
          notes: 'some notes',
        }

        const err = { status: 409 }
        lostBedService.update.mockImplementation(() => {
          throw err
        })
        const bespokeError: BespokeError = {
          errorTitle: 'some-bespoke-error',
          errorSummary: [],
        }
        ;(generateConflictBespokeError as jest.MockedFunction<typeof generateConflictBespokeError>).mockReturnValue(
          bespokeError,
        )

        await requestHandler(request, response, next)

        expect(generateConflictBespokeError).toHaveBeenCalledWith(err, premisesId, bedspaceId, 'plural')
        expect(insertBespokeError).toHaveBeenCalledWith(err, bespokeError)
        expect(insertGenericError).toHaveBeenCalledWith(err, 'startDate', 'conflict')
        expect(insertGenericError).toHaveBeenCalledWith(err, 'endDate', 'conflict')
        expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
          request,
          response,
          err,
          paths.lostBeds.edit({ premisesId, bedspaceId, lostBedId }),
        )
      })
    })
  })

  describe('edit', () => {
    it('renders the template for updating a lost bed', async () => {
      const premises = premisesFactory.build()
      const bedspace = cas3BedspaceFactory.build()
      const lostBed = lostBedFactory.build()
      const updateLostBed = updateLostBedFactory.build({ ...lostBed, reason: lostBed.reason.id })
      const lostBedReasons = referenceDataFactory.lostBedReasons().buildList(2)

      premisesService.getPremises.mockResolvedValue(premises)
      bedspaceService.getSingleBedspace.mockResolvedValue(bedspace)
      lostBedService.getUpdateLostBed.mockResolvedValue(updateLostBed)
      lostBedService.getReferenceData.mockResolvedValue(lostBedReasons)

      request.params = {
        premisesId: premises.id,
        bedspaceId: bedspace.id,
        lostBedId: lostBed.id,
      }

      const requestHandler = lostBedsController.edit()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({ errors: {}, errorSummary: [], userInput: {} })

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/lost-beds/edit', {
        lostBedReasons,
        errors: {},
        errorSummary: [],
        premises,
        bedspace,
        lostBedId: lostBed.id,
        ...updateLostBed,
        ...DateFormats.isoToDateAndTimeInputs(lostBed.startDate, 'startDate'),
        ...DateFormats.isoToDateAndTimeInputs(lostBed.endDate, 'endDate'),
      })
    })
  })

  describe('newCancellation', () => {
    it('renders the template for cancelling a lost bed', async () => {
      const premises = premisesFactory.build()
      const bedspace = cas3BedspaceFactory.build()
      const lostBed = lostBedFactory.active().build()

      premisesService.getPremises.mockResolvedValue(premises)
      bedspaceService.getSingleBedspace.mockResolvedValue(bedspace)
      lostBedService.find.mockResolvedValue(lostBed)

      request.params = {
        premisesId: premises.id,
        bedspaceId: bedspace.id,
        lostBedId: lostBed.id,
      }

      const requestHandler = lostBedsController.newCancellation()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({ errors: {}, errorSummary: [], userInput: {} })

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/lost-beds/cancel', {
        errors: {},
        errorSummary: [],
        premises,
        bedspace,
        lostBed,
        notes: lostBed.notes,
        allStatuses,
      })
    })
  })

  describe('createCancellation', () => {
    it('cancels a lost bed and redirects to the show lost bed page', async () => {
      const requestHandler = lostBedsController.createCancellation()

      const lostBed = lostBedFactory.build()
      const newLostBedCancellation = newLostBedCancellationFactory.build()
      const lostBedCancellation = lostBedCancellationFactory.build()

      lostBedService.cancel.mockResolvedValue(lostBedCancellation)

      request.params = {
        premisesId,
        bedspaceId,
        lostBedId: lostBed.id,
      }

      request.body = {
        ...newLostBedCancellation,
      }

      await requestHandler(request, response, next)

      expect(lostBedService.cancel).toHaveBeenCalledWith(callConfig, premisesId, lostBed.id, newLostBedCancellation)

      expect(request.flash).toHaveBeenCalledWith('success', 'Void booking cancelled')
      expect(response.redirect).toHaveBeenCalledWith(
        paths.lostBeds.show({ premisesId, bedspaceId, lostBedId: lostBed.id }),
      )
    })

    it('renders with errors if the API returns an error', async () => {
      const requestHandler = lostBedsController.createCancellation()

      const err = new Error()
      lostBedService.cancel.mockImplementation(() => {
        throw err
      })

      request.params = {
        premisesId,
        bedspaceId,
        lostBedId,
      }

      await requestHandler(request, response, next)

      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        err,
        paths.lostBeds.cancellations.new({ premisesId, bedspaceId, lostBedId }),
      )
    })
  })
})
