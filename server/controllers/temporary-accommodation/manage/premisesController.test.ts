import type { Request, Response, NextFunction } from 'express'
import { createMock, DeepMocked } from '@golevelup/ts-jest'

import premisesFactory from '../../../testutils/factories/premises'
import PremisesService from '../../../services/premisesService'
import PremisesController from './premisesController'
import paths from '../../../paths/temporary-accommodation/manage'
import { catchValidationErrorOrPropogate } from '../../../utils/validation'

jest.mock('../../../utils/validation')

describe('PremisesController', () => {
  const token = 'SOME_TOKEN'

  const request: DeepMocked<Request> = createMock<Request>({ user: { token } })
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const premisesService = createMock<PremisesService>({})
  const premisesController = new PremisesController(premisesService)

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
      const requestHandler = premisesController.new()

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/premises/new', {
        localAuthorities: [
          {
            name: 'Aberdeen City',
            id: '0fb03403-17e8-4b3a-b283-122a18ed8929',
          },
          {
            name: 'Babergh',
            id: 'c2892a98-dea6-4a80-9c3e-bf4e5c42ee0a',
          },
          {
            name: 'Caerphilly',
            id: '69fbc53a-a930-4d9f-b218-4c9c6bf3de7b',
          },
          {
            name: 'Dacorum',
            id: 'bed5ff2d-ee34-4423-967c-4dc50f12843e',
          },
        ],
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
