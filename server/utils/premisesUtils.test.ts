import paths from '../paths/temporary-accommodation/manage'
import premisesFactory from '../testutils/factories/premises'
import { getActiveStatuses, premisesActions, statusInfo, statusTag } from './premisesUtils'

describe('premisesUtils', () => {
  describe('premisesActions', () => {
    it('returns add a bedspace for an active premises', () => {
      const premises = premisesFactory.active().build()

      expect(premisesActions(premises)).toEqual([
        {
          text: 'Add a bedspace',
          classes: 'govuk-button--secondary',
          href: paths.premises.bedspaces.new({ premisesId: premises.id }),
        },
      ])
    })

    it('returns null for an archived premises', () => {
      const premises = premisesFactory.archived().build()

      expect(premisesActions(premises)).toEqual(null)
    })
  })

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
