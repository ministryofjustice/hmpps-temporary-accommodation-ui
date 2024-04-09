import { applicationFactory } from '../../../../testutils/factories'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'
import SexualBehaviourConcerns from './sexualBehaviourConcerns'

const body = {
  sexualBehaviourConcerns: 'yes' as const,
  sexualBehaviourConcernsDetail: 'Details',
}

describe('SexualBehaviourConcerns', () => {
  const application = applicationFactory.build()

  describe('body', () => {
    it('sets the body', () => {
      const page = new SexualBehaviourConcerns(body, application)

      expect(page.body).toEqual(body)
    })
  })

  itShouldHavePreviousValue(new SexualBehaviourConcerns({}, application), 'sexual-offence-conviction')
  itShouldHaveNextValue(new SexualBehaviourConcerns({}, application), '')

  describe('errors', () => {
    it('returns an empty object if all fields are populated', () => {
      const page = new SexualBehaviourConcerns(body, application)
      expect(page.errors()).toEqual({})
    })

    it('returns an error if the sexual behaviour concerns field is not populated', () => {
      const page = new SexualBehaviourConcerns({ ...body, sexualBehaviourConcerns: undefined }, application)
      expect(page.errors()).toEqual({
        sexualBehaviourConcerns: "Select yes if there are concerns about the person's sexual behaviour",
      })
    })

    it('returns an error if the sexual behaviour concerns detail field is not completed', () => {
      const page = new SexualBehaviourConcerns(
        {
          ...body,
          sexualBehaviourConcerns: 'yes',
          sexualBehaviourConcernsDetail: undefined,
        },
        application,
      )
      expect(page.errors()).toEqual({
        sexualBehaviourConcernsDetail: "Enter details about the person's sexual behaviour",
      })
    })
  })

  describe('response', () => {
    it('returns a translated version of the response with the details', () => {
      const page = new SexualBehaviourConcerns(body, application)
      expect(page.response()).toEqual({
        "Are there concerns about the person's sexual behaviour?": 'Yes - Details',
      })
    })

    it('returns a translated version of the response without the details if answered no', () => {
      const page = new SexualBehaviourConcerns({ sexualBehaviourConcerns: 'no' as const }, application)
      expect(page.response()).toEqual({
        "Are there concerns about the person's sexual behaviour?": 'No',
      })
    })
  })
})
