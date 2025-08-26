import paths from '../paths/temporary-accommodation/manage'
import { premisesFactory } from '../testutils/factories'
import {
  getActiveStatuses,
  premisesActions,
  shortAddress,
  showPropertySubNavArray,
  statusInfo,
  statusTag,
} from './premisesUtils'

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

      expect(getActiveStatuses([activeStatus1, activeStatus2])).toEqual([activeStatus1, activeStatus2])
    })
  })

  describe('statusInfo', () => {
    it('returns the info for a given status', () => {
      expect(statusInfo('active')).toEqual({
        name: 'Online',
        id: 'active',
        colour: 'turquoise',
        isActive: true,
      })
    })
  })

  describe('statusTag', () => {
    it('returns the HTML tag for a given status', () => {
      expect(statusTag('archived')).toEqual('<strong class="govuk-tag govuk-tag--grey">Archived</strong>')
    })
  })

  describe('shortAddress', () => {
    it('returns a shortened address for the premises when it does not have a town', () => {
      const premises = premisesFactory.build({
        addressLine1: '123 Road Lane',
        postcode: 'ABC 123',
      })
      premises.town = undefined

      expect(shortAddress(premises)).toEqual('123 Road Lane, ABC 123')
    })

    it('returns a shortened address for the premises when it does have a town', () => {
      const premises = premisesFactory.build({
        addressLine1: '123 Road Lane',
        town: 'Townville',
        postcode: 'ABC 123',
      })

      expect(shortAddress(premises)).toEqual('123 Road Lane, Townville, ABC 123')
    })
  })

  describe('showPropertySubNavArray', () => {
    it('returns the sub nav array for the premises tab', () => {
      const expectedResult = [
        {
          text: 'Property overview',
          href: '/properties/83b4062f-963e-450d-b912-589eab7ca91c',
          active: true,
        },
        {
          text: 'Bedspaces overview',
          href: '/properties/83b4062f-963e-450d-b912-589eab7ca91c/bedspaces',
          active: false,
        },
      ]

      const result = showPropertySubNavArray('83b4062f-963e-450d-b912-589eab7ca91c', 'premises')

      expect(result).toEqual(expectedResult)
    })

    it('returns the sub nav array for the bedspaces tab', () => {
      const expectedResult = [
        {
          text: 'Property overview',
          href: '/properties/6a2fc984-8cdd-4eef-8736-cc74f845ee47',
          active: false,
        },
        {
          text: 'Bedspaces overview',
          href: '/properties/6a2fc984-8cdd-4eef-8736-cc74f845ee47/bedspaces',
          active: true,
        },
      ]

      const result = showPropertySubNavArray('6a2fc984-8cdd-4eef-8736-cc74f845ee47', 'bedspaces')

      expect(result).toEqual(expectedResult)
    })
  })
})
