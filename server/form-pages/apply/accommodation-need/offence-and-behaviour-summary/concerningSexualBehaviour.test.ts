import { applicationFactory } from '../../../../testutils/factories'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'
import ConcerningSexualBehaviour from './concerningSexualBehaviour'

const body = {
  concerningSexualBehaviour: 'yes' as const,
  concerningSexualBehaviourDetail: 'Details',
}

describe('ConcerningSexualBehaviour', () => {
  const application = applicationFactory.build()

  describe('body', () => {
    it('sets the body', () => {
      const page = new ConcerningSexualBehaviour(body, application)

      expect(page.body).toEqual(body)
    })
  })

  itShouldHavePreviousValue(new ConcerningSexualBehaviour({}, application), 'history-of-sexual-offence')
  itShouldHaveNextValue(new ConcerningSexualBehaviour({}, application), '')

  describe('errors', () => {
    it('returns an empty object if all fields are populated', () => {
      const page = new ConcerningSexualBehaviour(body, application)
      expect(page.errors()).toEqual({})
    })

    it('returns an error if the sexual behaviour concerns field is not populated', () => {
      const page = new ConcerningSexualBehaviour({ ...body, concerningSexualBehaviour: undefined }, application)
      expect(page.errors()).toEqual({
        concerningSexualBehaviour: "Select yes if there are concerns about the person's sexual behaviour",
      })
    })

    it('returns an error if the sexual behaviour concerns detail field is not completed', () => {
      const page = new ConcerningSexualBehaviour(
        {
          ...body,
          concerningSexualBehaviour: 'yes',
          concerningSexualBehaviourDetail: undefined,
        },
        application,
      )
      expect(page.errors()).toEqual({
        concerningSexualBehaviourDetail: "Enter details about the person's sexual behaviour",
      })
    })
  })

  describe('response', () => {
    it('returns a translated version of the response with the details', () => {
      const page = new ConcerningSexualBehaviour(body, application)
      expect(page.response()).toEqual({
        "Are there concerns about the person's sexual behaviour?": 'Yes - Details',
      })
    })

    it('returns a translated version of the response without the details if answered no', () => {
      const page = new ConcerningSexualBehaviour({ concerningSexualBehaviour: 'no' as const }, application)
      expect(page.response()).toEqual({
        "Are there concerns about the person's sexual behaviour?": 'No',
      })
    })
  })
})
