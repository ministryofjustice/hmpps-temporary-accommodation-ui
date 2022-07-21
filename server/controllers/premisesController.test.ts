import type { Request, Response, NextFunction } from 'express'
import { createMock, DeepMocked } from '@golevelup/ts-jest'

import type { SummaryListItem } from 'approved-premises'
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

  describe('show', () => {
    it('should return the premises detail to the template', async () => {
      const premises = { name: 'Some premises', summaryList: { rows: [] as Array<SummaryListItem> } }
      premisesService.getPremisesDetails.mockResolvedValue(premises)

      request.params.id = 'some-uuid'

      const requestHandler = premisesController.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('premises/show', { premises })

      expect(premisesService.getPremisesDetails).toHaveBeenCalledWith('some-uuid')
    })
  })
})
