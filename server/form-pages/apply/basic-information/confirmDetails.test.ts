import type { Request } from 'express'
import { createMock, DeepMocked } from '@golevelup/ts-jest'

import ConfirmDetails from './confirmDetails'
import { PersonService } from '../../../services'
import type { DataServices } from '../../../services/applicationService'
import personFactory from '../../../testutils/factories/person'

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
    it('should return the data from the person service', async () => {
      const crn = 'CRN_GOES_HERE'

      request.params.id = 'some-uuid'
      request.user.token = 'some-token'
      request.session.application = {
        'some-uuid': {
          'basic-information': {
            'enter-crn': { crn },
          },
        },
      }

      const person = personFactory.build()
      personService.findByCrn.mockResolvedValue(person)

      await page.setup(request, services)

      expect(page.details).toEqual(person)
      expect(page.title).toEqual(`Confirm ${person.name}'s details`)

      expect(personService.findByCrn).toHaveBeenCalledWith(request.user.token, crn)
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
