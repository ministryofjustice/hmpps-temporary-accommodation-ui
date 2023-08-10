import { PersonRisksUI } from '../../../../@types/ui'
import { applicationFactory, personFactory } from '../../../../testutils/factories'
import { mapApiPersonRisksForUi } from '../../../../utils/utils'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'
import Cooperation from './cooperation'

jest.mock('../../../../utils/utils')

const body = { support: 'Support detail' }
const personRisksUi = { flags: { value: ['Some flag'] } } as PersonRisksUI

describe('Cooperation', () => {
  const application = applicationFactory.build({
    person: personFactory.build({
      name: 'John Smith',
    }),
  })

  describe('constructor', () => {
    it('sets the body and risk information', () => {
      ;(mapApiPersonRisksForUi as jest.MockedFunction<typeof mapApiPersonRisksForUi>).mockReturnValue(personRisksUi)

      const page = new Cooperation(body, application)

      expect(page.body).toEqual(body)
      expect(page.risks).toEqual(personRisksUi)

      expect(mapApiPersonRisksForUi).toHaveBeenCalledWith(application.risks)
    })
  })

  itShouldHavePreviousValue(new Cooperation({}, application), 'accommodation-sharing')
  itShouldHaveNextValue(new Cooperation({}, application), 'anti-social-behaviour')

  describe('errors', () => {
    it('returns an empty object if the support field is populated', () => {
      const page = new Cooperation(body, application)
      expect(page.errors()).toEqual({})
    })

    it('returns an error if the support field is not populated', () => {
      const page = new Cooperation({}, application)
      expect(page.errors()).toEqual({
        support: "You must specify how you will support John Smith's placement",
      })
    })
  })

  describe('response', () => {
    it('returns a translated version of the response', () => {
      const page = new Cooperation(body, application)
      expect(page.response()).toEqual({
        "How will you support this person's placement considering any risks to the support worker?": 'Support detail',
      })
    })
  })
})
