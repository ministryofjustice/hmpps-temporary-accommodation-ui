import { applicationFactory } from '../../../../testutils/factories'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'
import ConcerningArsonBehaviour from './concerningArsonBehaviour'

const body = {
  concerningArsonBehaviour: 'yes' as const,
  concerningArsonBehaviourDetail: 'Details',
}

describe('ConcerningArsonBehaviour', () => {
  const application = applicationFactory.build()

  describe('body', () => {
    it('sets the body', () => {
      const page = new ConcerningArsonBehaviour(body, application)

      expect(page.body).toEqual(body)
    })
  })

  itShouldHavePreviousValue(new ConcerningArsonBehaviour({}, application), 'history-of-arson-offence')
  itShouldHaveNextValue(new ConcerningArsonBehaviour({}, application), '')

  describe('errors', () => {
    it('returns an empty object if all fields are populated', () => {
      const page = new ConcerningArsonBehaviour(body, application)
      expect(page.errors()).toEqual({})
    })

    it('returns an error if the arson behaviour concerns field is not populated', () => {
      const page = new ConcerningArsonBehaviour({ ...body, concerningArsonBehaviour: undefined }, application)
      expect(page.errors()).toEqual({
        concerningArsonBehaviour: 'Select yes if there are concerns about arson for the person',
      })
    })

    it('returns an error if the arson behaviour concerns detail field is not completed', () => {
      const page = new ConcerningArsonBehaviour(
        {
          ...body,
          concerningArsonBehaviour: 'yes',
          concerningArsonBehaviourDetail: undefined,
        },
        application,
      )
      expect(page.errors()).toEqual({
        concerningArsonBehaviourDetail: "Enter details about the person's behaviour around arson",
      })
    })
  })

  describe('response', () => {
    it('returns a translated version of the response with the details', () => {
      const page = new ConcerningArsonBehaviour(body, application)
      expect(page.response()).toEqual({
        'Are there concerns about arson for the person?': 'Yes - Details',
      })
    })

    it('returns a translated version of the response without the details if answered no', () => {
      const page = new ConcerningArsonBehaviour({ concerningArsonBehaviour: 'no' as const }, application)
      expect(page.response()).toEqual({
        'Are there concerns about arson for the person?': 'No',
      })
    })
  })
})
