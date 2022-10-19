import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../shared-examples'
import { convertKeyValuePairToRadioItems } from '../../../utils/formUtils'

import ApType from './apType'
import applicationFactory from '../../../testutils/factories/application'
import personFactory from '../../../testutils/factories/person'

jest.mock('../../../utils/formUtils')

describe('ApType', () => {
  let application = applicationFactory.build()

  describe('title', () => {
    it('shold add the name of the person', () => {
      const person = personFactory.build({ name: 'John Wayne' })
      application = applicationFactory.build({ person })

      const page = new ApType({}, application)

      expect(page.title).toEqual('Which type of AP does John Wayne require?')
    })
  })

  describe('body', () => {
    it('should strip unknown attributes from the body', () => {
      const page = new ApType({ type: 'standard', something: 'else' }, application)

      expect(page.body).toEqual({ type: 'standard' })
    })
  })

  itShouldHavePreviousValue(new ApType({}, application), '')

  describe('when type is set to pipe', () => {
    itShouldHaveNextValue(new ApType({ type: 'pipe' }, application), 'pipe-referral')
  })

  describe('when type is set to esap', () => {
    itShouldHaveNextValue(new ApType({ type: 'esap' }, application), 'esap-placement-screening')
  })

  describe('when type is set to standard', () => {
    itShouldHaveNextValue(new ApType({ type: 'standard' }, application), null)
  })

  describe('errors', () => {
    it('should return an empty object if the type is populated', () => {
      const page = new ApType({ type: 'riskManagement' }, application)
      expect(page.errors()).toEqual({})
    })

    it('should return an errors if the type is not populated', () => {
      const page = new ApType({ type: '' }, application)
      expect(page.errors()).toEqual({ type: 'You must specify an AP type' })
    })
  })

  describe('items', () => {
    it('it calls convertKeyValuePairToRadioItems', () => {
      const page = new ApType({ type: '' }, application)
      page.items()

      expect(convertKeyValuePairToRadioItems).toHaveBeenCalled()
    })
  })

  describe('response', () => {
    it('should return a translated version of the response', () => {
      const page = new ApType({ type: 'pipe' }, application)

      expect(page.response()).toEqual({
        [page.title]: 'PIPE (physcologically informed planned environment)',
      })
    })
  })
})
