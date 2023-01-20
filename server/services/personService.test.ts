import type { Person } from '@approved-premises/api'

import PersonService from './personService'
import PersonClient from '../data/personClient'
import PersonFactory from '../testutils/factories/person'
import risksFactory from '../testutils/factories/risks'
import { mapApiPersonRisksForUi } from '../utils/utils'
import { createMockRequest } from '../testutils/createMockRequest'

jest.mock('../data/personClient.ts')

describe('PersonService', () => {
  const personClient = new PersonClient(null) as jest.Mocked<PersonClient>
  const personClientFactory = jest.fn()

  const service = new PersonService(personClientFactory)

  const request = createMockRequest()

  beforeEach(() => {
    jest.resetAllMocks()
    personClientFactory.mockReturnValue(personClient)
  })

  describe('findByCrn', () => {
    it('on success returns the person given their CRN', async () => {
      const person: Person = PersonFactory.build()
      personClient.search.mockResolvedValue(person)

      const postedPerson = await service.findByCrn(request, 'crn')

      expect(postedPerson).toEqual(person)

      expect(personClientFactory).toHaveBeenCalledWith(request)
      expect(personClient.search).toHaveBeenCalledWith('crn')
    })
  })

  describe('getPersonRisks', () => {
    it("on success returns the person's risks given their CRN", async () => {
      const apiRisks = risksFactory.build()
      const uiRisks = mapApiPersonRisksForUi(apiRisks)
      personClient.risks.mockResolvedValue(apiRisks)

      const postedPerson = await service.getPersonRisks(request, 'crn')

      expect(postedPerson).toEqual(uiRisks)

      expect(personClientFactory).toHaveBeenCalledWith(request)
      expect(personClient.risks).toHaveBeenCalledWith('crn')
    })
  })
})
