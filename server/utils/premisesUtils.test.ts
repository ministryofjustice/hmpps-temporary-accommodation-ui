import { getActiveStatuses, statusInfo, statusTag } from './premisesUtils'

describe('premisesUtils', () => {
  describe('getActiveStatuses', () => {
    it('returns only active statuses', () => {
      const activeStatus1 = {
        name: 'Online',
        id: 'active' as const,
        colour: 'turquoise',
        isActive: true,
      }
      const activeStatus2 = {
        name: 'Archived',
        id: 'archived' as const,
        colour: 'grey',
        isActive: true,
      }
      const inactiveStatus = {
        name: 'Pending',
        id: 'pending' as const,
        colour: 'yellow',
        isActive: false,
      }

      expect(getActiveStatuses([activeStatus1, activeStatus2, inactiveStatus])).toEqual([activeStatus1, activeStatus2])
    })
  })

  describe('statusInfo', () => {
    it('returns the info for a given status', () => {
      expect(statusInfo('pending')).toEqual({
        name: 'Pending',
        id: 'pending',
        colour: 'yellow',
        isActive: false,
      })
    })
  })

  describe('statusTag', () => {
    it('returns the HTML tag for a given status', () => {
      expect(statusTag('pending')).toEqual('<strong class="govuk-tag govuk-tag--yellow">Pending</strong>')
    })
  })
})
