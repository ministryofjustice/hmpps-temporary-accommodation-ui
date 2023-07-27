import { applicationFactory, personFactory } from '../../../../testutils/factories'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'
import MoveOnPlan from './moveOnPlan'

const body = { plan: 'A plan' }

describe('MoveOnPlan', () => {
  const application = applicationFactory.build({
    person: personFactory.build({
      name: 'Some Name',
    }),
  })

  describe('body', () => {
    it('sets the body', () => {
      const page = new MoveOnPlan(body, application)

      expect(page.body).toEqual(body)
    })
  })

  describe('title', () => {
    it('sets the body', () => {
      const page = new MoveOnPlan(body, application)

      expect(page.title).toEqual('How will you prepare Some Name for move on after placement?')
    })
  })

  itShouldHavePreviousValue(new MoveOnPlan({}, application), 'dashboard')
  itShouldHaveNextValue(new MoveOnPlan({}, application), '')

  describe('errors', () => {
    it('returns an empty object if the plan is defined', () => {
      const page = new MoveOnPlan(body, application)
      expect(page.errors()).toEqual({})
    })

    it('returns an error if the plan is not populated', () => {
      const page = new MoveOnPlan({ ...body, plan: undefined }, application)
      expect(page.errors()).toEqual({ plan: 'You must specify a move on plan' })
    })
  })

  describe('response', () => {
    it('returns a translated version of the response', () => {
      const page = new MoveOnPlan(body, application)

      expect(page.response()).toEqual({
        'How will you prepare Some Name for move on after placement?': 'A plan',
      })
    })
  })
})
