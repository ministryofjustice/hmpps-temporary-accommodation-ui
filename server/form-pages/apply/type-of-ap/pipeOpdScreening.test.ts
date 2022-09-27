import { itShouldHavePreviousValue } from '../../shared-examples'

import PipeOpdScreening from './pipeOpdScreening'

describe('PipeOpdScreening', () => {
  describe('body', () => {
    it('should strip unknown attributes from the body', () => {
      const page = new PipeOpdScreening({
        pipeReferral: 'yes',
        pipeReferralMoreDetail: 'More detail',
        something: 'else',
      })

      expect(page.body).toEqual({ pipeReferral: 'yes', pipeReferralMoreDetail: 'More detail' })
    })
  })

  itShouldHavePreviousValue(new PipeOpdScreening({}), 'pipe-referral')

  describe('errors', () => {
    it('should return an empty array if the pipeReferral is populated', () => {
      const page = new PipeOpdScreening({ pipeReferral: 'yes' })
      expect(page.errors()).toEqual([])
    })

    it('should return an errors if the pipeReferral is not populated', () => {
      const page = new PipeOpdScreening({ pipeReferral: '' })
      expect(page.errors()).toEqual([
        {
          propertyName: '$.pipeReferral',
          errorType: 'blank',
        },
      ])
    })
  })
})
