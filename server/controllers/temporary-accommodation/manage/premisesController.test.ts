import type { Request, Response, NextFunction } from 'express'
import { createMock, DeepMocked } from '@golevelup/ts-jest'

import type { ErrorsAndUserInput, SummaryListItem } from '@approved-premises/ui'
import premisesFactory from '../../../testutils/factories/premises'
import newPremisesFactory from '../../../testutils/factories/newPremises'
import updatePremisesFactory from '../../../testutils/factories/updatePremises'
import roomFactory from '../../../testutils/factories/room'
import PremisesService from '../../../services/premisesService'
import PremisesController from './premisesController'
import paths from '../../../paths/temporary-accommodation/manage'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../../utils/validation'
import BedspaceService from '../../../services/bedspaceService'
import { allStatuses } from '../../../utils/premisesUtils'
import referenceDataFactory from '../../../testutils/factories/referenceData'

jest.mock('../../../utils/validation')

describe('PremisesController', () => {
  const token = 'SOME_TOKEN'

  const referenceData = {
    localAuthorities: referenceDataFactory.localAuthority().buildList(5),
    characteristics: referenceDataFactory.characteristic('premises').buildList(5),
    probationRegions: referenceDataFactory.probationRegion().buildList(5),
  }

  let request: DeepMocked<Request>

  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const premisesService = createMock<PremisesService>({})
  const bedspaceService = createMock<BedspaceService>({})
  const premisesController = new PremisesController(premisesService, bedspaceService)

  beforeEach(() => {
    request = createMock<Request>({ user: { token } })
  })

  describe('index', () => {
    it('returns the table rows to the template', async () => {
      premisesService.tableRows.mockResolvedValue([])

      const requestHandler = premisesController.index()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/premises/index', { tableRows: [] })

      expect(premisesService.tableRows).toHaveBeenCalledWith(token)
    })
  })

  describe('new', () => {
    it('renders the form', async () => {
      premisesService.getReferenceData.mockResolvedValue(referenceData)

      const requestHandler = premisesController.new()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({ errors: {}, errorSummary: [], userInput: {} })

      await requestHandler(request, response, next)

      expect(premisesService.getReferenceData).toHaveBeenCalledWith(token)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/premises/new', {
        allLocalAuthorities: referenceData.localAuthorities,
        allCharacteristics: referenceData.characteristics,
        allStatuses,
        characteristicIds: [],
        errors: {},
        errorSummary: [],
      })
    })

    it('renders the form with errors and user input if an error has been sent to the flash', async () => {
      premisesService.getReferenceData.mockResolvedValue(referenceData)

      const requestHandler = premisesController.new()

      const errorsAndUserInput = createMock<ErrorsAndUserInput>()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue(errorsAndUserInput)

      await requestHandler(request, response, next)

      expect(premisesService.getReferenceData).toHaveBeenCalledWith(token)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/premises/new', {
        allLocalAuthorities: referenceData.localAuthorities,
        allCharacteristics: referenceData.characteristics,
        allStatuses,
        characteristicIds: [],
        errors: errorsAndUserInput.errors,
        errorSummary: errorsAndUserInput.errorSummary,
        ...errorsAndUserInput.userInput,
      })
    })
  })

  describe('create', () => {
    it('creates a premises and redirects to the show premises page', async () => {
      const requestHandler = premisesController.create()

      const premises = premisesFactory.build()
      const newPremises = newPremisesFactory.build()

      delete newPremises.characteristicIds

      request.body = {
        ...newPremises,
      }

      premisesService.create.mockResolvedValue(premises)

      await requestHandler(request, response, next)

      expect(premisesService.create).toHaveBeenCalledWith(token, {
        ...newPremises,
        characteristicIds: [],
      })

      expect(request.flash).toHaveBeenCalledWith('success', 'Property created')
      expect(response.redirect).toHaveBeenCalledWith(paths.premises.show({ premisesId: premises.id }))
    })

    it('renders with errors if the API returns an error', async () => {
      const requestHandler = premisesController.create()

      const premises = premisesFactory.build()

      const err = new Error()

      premisesService.create.mockImplementation(() => {
        throw err
      })

      request.body = {
        name: premises.name,
        postcode: premises.postcode,
      }

      await requestHandler(request, response, next)

      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(request, response, err, paths.premises.new({}))
    })
  })

  describe('edit', () => {
    it('renders the form', async () => {
      premisesService.getReferenceData.mockResolvedValue(referenceData)

      const premises = premisesFactory.build()
      const updatePremises = updatePremisesFactory.build({
        ...premises,
      })
      premisesService.getUpdatePremises.mockResolvedValue(updatePremises)

      const requestHandler = premisesController.edit()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({ errors: {}, errorSummary: [], userInput: {} })

      request.params.premisesId = premises.id
      await requestHandler(request, response, next)

      expect(premisesService.getReferenceData).toHaveBeenCalledWith(token)
      expect(premisesService.getUpdatePremises).toHaveBeenCalledWith(token, premises.id)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/premises/edit', {
        allLocalAuthorities: referenceData.localAuthorities,
        allCharacteristics: referenceData.characteristics,
        allStatuses,
        characteristicIds: [],
        errors: {},
        errorSummary: [],
        ...updatePremises,
      })
    })

    it('renders the form with errors and user input if an error has been sent to the flash', async () => {
      premisesService.getReferenceData.mockResolvedValue(referenceData)

      const premises = premisesFactory.build()
      const updatePremises = updatePremisesFactory.build({
        ...premises,
      })
      premisesService.getUpdatePremises.mockResolvedValue(updatePremises)

      const requestHandler = premisesController.edit()

      const errorsAndUserInput = createMock<ErrorsAndUserInput>()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue(errorsAndUserInput)

      request.params.premisesId = premises.id
      await requestHandler(request, response, next)

      expect(premisesService.getReferenceData).toHaveBeenCalledWith(token)
      expect(premisesService.getUpdatePremises).toHaveBeenCalledWith(token, premises.id)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/premises/edit', {
        allLocalAuthorities: referenceData.localAuthorities,
        allCharacteristics: referenceData.characteristics,
        allStatuses,
        characteristicIds: [],
        errors: errorsAndUserInput.errors,
        errorSummary: errorsAndUserInput.errorSummary,
        ...errorsAndUserInput.userInput,
        ...updatePremises,
      })
    })
  })

  describe('update', () => {
    it('updates a premises and redirects to the show premises page', async () => {
      const requestHandler = premisesController.update()

      const premises = premisesFactory.build()
      const newPremises = newPremisesFactory.build({ ...premises })

      delete newPremises.characteristicIds

      request.params.premisesId = premises.id
      request.body = {
        ...newPremises,
      }

      premisesService.update.mockResolvedValue(premises)

      await requestHandler(request, response, next)

      expect(premisesService.update).toHaveBeenCalledWith(token, premises.id, {
        ...newPremises,
        characteristicIds: [],
      })

      expect(request.flash).toHaveBeenCalledWith('success', 'Property updated')
      expect(response.redirect).toHaveBeenCalledWith(paths.premises.show({ premisesId: premises.id }))
    })

    it('renders with errors if the API returns an error', async () => {
      const requestHandler = premisesController.update()

      const premises = premisesFactory.build()

      const err = new Error()

      premisesService.update.mockImplementation(() => {
        throw err
      })

      request.params.premisesId = premises.id
      request.body = {
        name: premises.name,
        postcode: premises.postcode,
      }

      await requestHandler(request, response, next)

      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        err,
        paths.premises.edit({ premisesId: premises.id }),
      )
    })
  })

  describe('show', () => {
    it('should return the premises details to the template', async () => {
      const premises = premisesFactory.build()
      const rooms = roomFactory.buildList(5)

      const details = { premises, summaryList: { rows: [] as Array<SummaryListItem> } }
      premisesService.getPremisesDetails.mockResolvedValue(details)

      const bedspaceDetails = rooms.map(room => ({ room, summaryList: { rows: [] as Array<SummaryListItem> } }))
      bedspaceService.getBedspaceDetails.mockResolvedValue(bedspaceDetails)

      request.params.premisesId = premises.id

      const requestHandler = premisesController.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/premises/show', {
        ...details,
        bedspaces: bedspaceDetails,
      })

      expect(premisesService.getPremisesDetails).toHaveBeenCalledWith(token, premises.id)
      expect(bedspaceService.getBedspaceDetails).toHaveBeenCalledWith(token, premises.id)
    })
  })
})
