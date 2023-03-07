import { formatStatus, getActiveStatuses } from './premisesUtils'

describe('premisesUtils', () => {
  describe('getActiveStatuses', () => {
    it('returns only active statuses', () => {
      const activeStatus1 = {
        name: 'Online',
        id: 'active' as const,
        isActive: true,
      }
      const activeStatus2 = {
        name: 'Archived',
        id: 'archived' as const,
        isActive: true,
      }
      const inactiveStatus = {
        name: 'Pending',
        id: 'pending' as const,
        isActive: false,
      }

      expect(getActiveStatuses([activeStatus1, activeStatus2, inactiveStatus])).toEqual([activeStatus1, activeStatus2])
    })
  })

  describe('formatStatus', () => {
    it('returns the display name of a given status', () => {
      expect(formatStatus('pending')).toEqual('Pending')
    })
  })
})
