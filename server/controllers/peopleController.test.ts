import type { Request, Response, NextFunction } from 'express'
import { createMock, DeepMocked } from '@golevelup/ts-jest'

import PeopleController from './peopleController'
import PersonService from '../services/personService'
import personFactory from '../testutils/factories/person'
import { catchValidationErrorOrPropogate } from '../utils/validation'

jest.mock('../utils/validation')

describe('PeopleController', () => {
  const token = 'SOME_TOKEN'
  const premisesId = 'premisesId'

  const request: DeepMocked<Request> = createMock<Request>({ user: { token } })
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const personService = createMock<PersonService>({})

  let peopleController: PeopleController

  beforeEach(() => {
    peopleController = new PeopleController(personService)
  })

  describe('find', () => {
    it('should return the person related to the CRN if they exist', async () => {
      const person = personFactory.build()
      personService.findByCrn.mockResolvedValue(person)
      const flashSpy = jest.fn()

      const requestHandler = peopleController.find()

      await requestHandler(
        {
          ...request,
          params: { premisesId },
          body: { crn: person.crn, successUrl: 'success/', failureUrl: 'failure/' },
          headers: {
            referer: 'some-referrer/',
          },
          flash: flashSpy,
        },
        response,
        next,
      )

      expect(response.redirect).toHaveBeenCalledWith('some-referrer/')
      expect(personService.findByCrn).toHaveBeenCalledWith(token, person.crn)
      expect(flashSpy).toHaveBeenCalledWith('crn', person.crn)
    })

    it('renders with errors if the API returns an error', async () => {
      const requestHandler = peopleController.find()

      const err = new Error()

      personService.findByCrn.mockImplementation(() => {
        throw err
      })

      await requestHandler(
        {
          ...request,
          params: { premisesId },
          body: { successUrl: 'success/', failureUrl: 'failure/' },
          headers: {
            referer: 'some-referrer/',
          },
        },
        response,
        next,
      )

      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(request, response, err, 'some-referrer/')
    })
  })
})
