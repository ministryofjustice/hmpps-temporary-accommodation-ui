import { itShouldHaveNextValue } from '../../shared-examples'
import { convertKeyValuePairToRadioItems } from '../../../utils/formUtils'

import ApType from './apType'

jest.mock('../../../utils/formUtils')

describe('ApType', () => {
  describe('body', () => {
    it('should strip unknown attributes from the body', () => {
      const page = new ApType({ type: 'standard', something: 'else' })

      expect(page.body).toEqual({ type: 'standard' })
    })
  })

  describe('when type is set to pipe', () => {
    itShouldHaveNextValue(new ApType({ type: 'pipe' }), 'pipe-referral')
  })

  describe('when type is set to esap', () => {
    itShouldHaveNextValue(new ApType({ type: 'esap' }), 'esap-placement-screening')
  })

  describe('when type is set to standard', () => {
    itShouldHaveNextValue(new ApType({ type: 'standard' }), null)
  })

  describe('errors', () => {
    it('should return an empty array if the type is populated', () => {
      const page = new ApType({ type: 'riskManagement' })
      expect(page.errors()).toEqual([])
    })

    it('should return an errors if the type is not populated', () => {
      const page = new ApType({ type: '' })
      expect(page.errors()).toEqual([
        {
          propertyName: 'type',
          errorType: 'blank',
        },
      ])
    })
  })

  describe('items', () => {
    it('it calls convertKeyValuePairToRadioItems', () => {
      const page = new ApType({ type: '' })
      page.items()

      expect(convertKeyValuePairToRadioItems).toHaveBeenCalled()
    })
  })
})
