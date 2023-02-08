import type { Request, Response, NextFunction } from 'express'
import { createMock, DeepMocked } from '@golevelup/ts-jest'

import OffencesController from './offencesController'
import PersonService from '../../../services/personService'
import personFactory from '../../../testutils/factories/person'
import activeOffenceFactory from '../../../testutils/factories/activeOffence'
import extractCallConfig from '../../../utils/restUtils'
import { CallConfig } from '../../../data/restClient'

jest.mock('../../../utils/restUtils')

describe('OffencesController', () => {
  const callConfig = { token: 'some-call-config-token' } as CallConfig

  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const personService = createMock<PersonService>({})

  let offencesController: OffencesController
  let request: DeepMocked<Request>

  beforeEach(() => {
    jest.resetAllMocks()
    offencesController = new OffencesController(personService)
    request = createMock<Request>({
      params: { crn: 'some-crn' },
    })
    ;(extractCallConfig as jest.MockedFn<typeof extractCallConfig>).mockReturnValue(callConfig)
  })

  describe('selectOffence', () => {
    it('should return the a list of offences for the person', async () => {
      const person = personFactory.build()
      const offences = activeOffenceFactory.buildList(5)

      personService.findByCrn.mockResolvedValue(person)
      personService.getOffences.mockResolvedValue(offences)

      const requestHandler = offencesController.selectOffence()

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('applications/people/selectOffence', {
        pageHeading: `Select index offence for ${person.name}`,
        person,
        offences,
      })

      expect(personService.findByCrn).toHaveBeenCalledWith(callConfig, 'some-crn')
      expect(personService.getOffences).toHaveBeenCalledWith(callConfig, 'some-crn')
    })
  })
})
