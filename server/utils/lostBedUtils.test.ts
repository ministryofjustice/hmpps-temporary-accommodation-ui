import { lostBedActions, statusTag } from './lostBedUtils'
import lostBedFactory from '../testutils/factories/lostBed'

describe('lostBedUtils', () => {
  describe('statusTag', () => {
    it('returns a correctly formatted string', () => {
      const result = statusTag('active', 'voidsOnly')

      expect(result).toEqual('<strong class="govuk-tag govuk-tag--blue">Active</strong>')
    })
  })

  describe('lostBedActions', () => {
    it('returns actions array when lost bed status is active', () => {
      const lostBed = lostBedFactory.active().build()

      const result = lostBedActions('premisesId', 'roomId', lostBed)
      expect(result.length).toEqual(2)
    })

    it('returns null when lost bed status is cancelled', () => {
      const lostBed = lostBedFactory.build({ status: 'cancelled' })

      const result = lostBedActions('premisesId', 'roomId', lostBed)
      expect(result).toEqual(null)
    })
  })
})
