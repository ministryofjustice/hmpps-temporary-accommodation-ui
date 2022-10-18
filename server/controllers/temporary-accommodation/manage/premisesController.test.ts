import type { Request, Response, NextFunction } from 'express'
import { createMock, DeepMocked } from '@golevelup/ts-jest'

import premisesFactory from '../../../testutils/factories/premises'
import localAuthorityFactory from '../../../testutils/factories/localAuthority'
import PremisesService from '../../../services/premisesService'
import PremisesController from './premisesController'
import paths from '../../../paths/temporary-accommodation/manage'
import { catchValidationErrorOrPropogate } from '../../../utils/validation'
import { LocalAuthorityService } from '../../../services'

jest.mock('../../../utils/validation')

describe('PremisesController', () => {
  const token = 'SOME_TOKEN'

  const request: DeepMocked<Request> = createMock<Request>({ user: { token } })
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const premisesService = createMock<PremisesService>({})
  const localAuthorityService = createMock<LocalAuthorityService>({})
  const premisesController = new PremisesController(premisesService, localAuthorityService)

  describe('index', () => {
    it('should return the table rows to the template', async () => {
      premisesService.tableRows.mockResolvedValue([])

      const requestHandler = premisesController.index()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/premises/index', { tableRows: [] })

      expect(premisesService.tableRows).toHaveBeenCalledWith(token, 'temporary-accommodation')
    })
  })

  describe('new', () => {
    it('show render the form', async () => {
      const localAuthorities = localAuthorityFactory.buildList(5)

      localAuthorityService.getLocalAuthorities.mockResolvedValue(localAuthorities)

      const requestHandler = premisesController.new()

      await requestHandler(request, response, next)

      expect(localAuthorityService.getLocalAuthorities).toHaveBeenCalledWith(token)
      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/premises/new', {
        localAuthorities,
      })
    })
  })

  describe('create', () => {
    it('creates a premises and redirects to the new premises page', async () => {
      const requestHandler = premisesController.create()

      const premises = premisesFactory.build()

      request.body = {
        name: premises.name,
        postcode: premises.postcode,
      }

      await requestHandler(request, response, next)

      expect(premisesService.create).toHaveBeenCalledWith(token, {
        name: premises.name,
        postcode: premises.postcode,
        service: 'temporary-accommodation',
      })

      expect(request.flash).toHaveBeenCalledWith('success', 'Property created')
      expect(response.redirect).toHaveBeenCalledWith(paths.premises.new({}))
    })

    it('renders with errors if the API returns an error', async () => {
      const requestHandler = premisesController.create()

      const err = new Error()

      premisesService.create.mockImplementation(() => {
        throw err
      })

      request.body = {
        county: 'some county',
        town: 'some town',
        type: 'single',
        address: 'some address',
      }

      await requestHandler(request, response, next)

      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(request, response, err, paths.premises.new({}))
    })
  })
})
