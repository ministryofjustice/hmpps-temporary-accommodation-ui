import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'

import { CallConfig } from '../../data/restClient'
import PersonService from '../../services/personService'
import { personFactory } from '../../testutils/factories'
import extractCallConfig from '../../utils/restUtils'
import { errorMessage, errorSummary } from '../../utils/validation'
import PeopleController from './peopleController'

jest.mock('../../utils/restUtils')

describe('PeopleController', () => {
  const callConfig = { token: 'some-call-config-token' } as CallConfig
  const premisesId = 'premisesId'
  const flashSpy = jest.fn()

  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const personService = createMock<PersonService>({})

  let peopleController: PeopleController
  let request: DeepMocked<Request>

  beforeEach(() => {
    jest.resetAllMocks()
    peopleController = new PeopleController(personService)
    request = createMock<Request>({
      flash: flashSpy,
      params: { premisesId },
      headers: {
        referer: 'some-referrer/',
      },
    })
    ;(extractCallConfig as jest.MockedFn<typeof extractCallConfig>).mockReturnValue(callConfig)
  })

  describe('find', () => {
    it('should return the person related to the CRN if they exist', async () => {
      const person = personFactory.build()
      personService.findByCrn.mockResolvedValue(person)

      const requestHandler = peopleController.find()

      request.body.crn = person.crn

      await requestHandler(request, response, next)

      expect(response.redirect).toHaveBeenCalledWith('some-referrer/')
      expect(personService.findByCrn).toHaveBeenCalledWith(callConfig, person.crn)
      expect(flashSpy).toHaveBeenCalledWith('crn', person.crn)
    })

    it('sends an error to the flash if a crn has not been provided', async () => {
      request.body = {}

      const requestHandler = peopleController.find()

      await requestHandler(request, response, next)

      expect(response.redirect).toHaveBeenCalledWith('some-referrer/')

      expect(flashSpy).toHaveBeenCalledWith('errors', { crn: errorMessage('crn', 'You must enter a CRN') })
      expect(flashSpy).toHaveBeenCalledWith('errorSummary', [errorSummary('crn', 'You must enter a CRN')])
    })

    it('sends an error to the flash if the API returns a 404', async () => {
      const requestHandler = peopleController.find()

      const err = { data: {}, status: 404 }

      personService.findByCrn.mockImplementation(() => {
        throw err
      })

      request.body.crn = 'SOME_CRN'

      await requestHandler(request, response, next)

      expect(response.redirect).toHaveBeenCalledWith('some-referrer/')

      expect(flashSpy).toHaveBeenCalledWith('errors', {
        crn: errorMessage('crn', "No person with an CRN of 'SOME_CRN' was found"),
      })
      expect(flashSpy).toHaveBeenCalledWith('errorSummary', [
        errorSummary('crn', "No person with an CRN of 'SOME_CRN' was found"),
      ])
    })

    it('throws the error if the error is of another type', async () => {
      const requestHandler = peopleController.find()

      const err = new Error()

      personService.findByCrn.mockImplementation(() => {
        throw err
      })

      request.body.crn = 'SOME_CRN'

      expect(async () => requestHandler(request, response, next)).rejects.toThrow(err)
    })
  })
})
