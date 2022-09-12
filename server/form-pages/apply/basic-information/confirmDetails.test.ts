import type { Request } from 'express'
import { createMock, DeepMocked } from '@golevelup/ts-jest'

import ConfirmDetails from './confirmDetails'
import { PersonService } from '../../../services'
import type { DataServices } from '../../../services/applicationService'
import personFactory from '../../../testutils/factories/person'

import { SanitisedError } from '../../../sanitisedError'
import { TasklistAPIError } from '../../../utils/errors'

describe('ConfirmDetails', () => {
  let page: ConfirmDetails
  let request: DeepMocked<Request>

  const personService = createMock<PersonService>({})
  const services = createMock<DataServices>({
    personService,
  }) as DataServices

  beforeEach(async () => {
    page = new ConfirmDetails()
    request = createMock<Request>({})
  })

  describe('setup', () => {
    const crn = 'CRN_GOES_HERE'

    beforeEach(() => {
      request.params.id = 'some-uuid'
      request.user.token = 'some-token'
      request.session.application = {
        'some-uuid': {
          'basic-information': {
            'enter-crn': { crn },
          },
        },
      }
    })

    it('should return the data from the person service', async () => {
      const person = personFactory.build()
      personService.findByCrn.mockResolvedValue(person)

      await page.setup(request, services)

      expect(page.details).toEqual(person)
      expect(page.title).toEqual(`Confirm ${person.name}'s details`)

      expect(personService.findByCrn).toHaveBeenCalledWith(request.user.token, crn)
    })

    it('should throw an error if the API returns a 404 error', async () => {
      const error = {
        status: 404,
      } as SanitisedError

      personService.findByCrn.mockImplementation(() => {
        throw error
      })

      expect(async () => {
        await page.setup(request, services)
      }).rejects.toThrow(new TasklistAPIError(`No person with an CRN of '${crn}' was found`, 'crn'))
    })

    it('should bubble up the error if the error is not a 404', async () => {
      const error = new Error('Generic Error')

      personService.findByCrn.mockImplementation(() => {
        throw error
      })

      expect(async () => {
        await page.setup(request, services)
      }).rejects.toThrow(error)
    })
  })

  describe('next', () => {
    it('should return the sentence-type step', () => {
      expect(page.next()).toEqual('sentence-type')
    })
  })

  describe('previous', () => {
    it('should return the enter-crn step', () => {
      expect(page.previous()).toEqual('enter-crn')
    })
  })
})
