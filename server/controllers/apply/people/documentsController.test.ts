import type { Request, Response, NextFunction } from 'express'
import { createMock, DeepMocked } from '@golevelup/ts-jest'

import DocumentsController from './documentsController'
import PersonService from '../../../services/personService'
import extractCallConfig from '../../../utils/restUtils'
import { CallConfig } from '../../../data/restClient'

jest.mock('../../../utils/restUtils')

describe('DocumentsController', () => {
  const callConfig = { token: 'some-call-config-token' } as CallConfig

  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const personService = createMock<PersonService>({})

  let documentsController: DocumentsController
  let request: DeepMocked<Request>

  beforeEach(() => {
    jest.resetAllMocks()
    documentsController = new DocumentsController(personService)
    request = createMock<Request>({
      params: { crn: 'some-crn', documentId: 'documentId' },
    })
    ;(extractCallConfig as jest.MockedFn<typeof extractCallConfig>).mockReturnValue(callConfig)
  })

  describe('show', () => {
    it('should fetch a document', async () => {
      const requestHandler = documentsController.show()

      await requestHandler(request, response, next)

      expect(personService.getDocument).toHaveBeenCalledWith(callConfig, 'some-crn', 'documentId', response)
    })
  })
})
