import type { Request, Response, NextFunction } from 'express'
import { createMock, DeepMocked } from '@golevelup/ts-jest'

import PremisesService from '../services/premisesService'
import PremisesController from './premisesController'

describe('PremisesController', () => {
  const request: DeepMocked<Request> = createMock<Request>({})
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  let premisesController: PremisesController
  let premisesService: DeepMocked<PremisesService>

  beforeEach(() => {
    premisesService = createMock<PremisesService>({})
    premisesController = new PremisesController(premisesService)
  })

  describe('index', () => {
    it('should return the table rows to the template', async () => {
      premisesService.tableRows.mockResolvedValue([])

      const requestHandler = premisesController.index()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('premises/index', { tableRows: [] })
    })
  })
})
