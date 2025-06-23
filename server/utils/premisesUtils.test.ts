import paths from '../paths/temporary-accommodation/manage'
import { premisesFactory } from '../testutils/factories'
import {
  createPremisesSubNavArr,
  getActiveStatuses,
  getSearchLabel,
  getStatusDisplayName,
  premisesActions,
  shortAddress,
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

  describe('createPremisesSubNavArr', () => {
    it('returns sub navigation array with active status highlighted', () => {
      const result = createPremisesSubNavArr('active')

      expect(result).toEqual([
        {
          text: 'Online properties',
          href: '/properties?status=active',
          active: true,
        },
        {
          text: 'Archived properties',
          href: '/properties?status=archived',
          active: false,
        },
      ])
    })

    it('returns sub navigation array with archived status highlighted', () => {
      const result = createPremisesSubNavArr('archived')

      expect(result).toEqual([
        {
          text: 'Online properties',
          href: '/properties?status=active',
          active: false,
        },
        {
          text: 'Archived properties',
          href: '/properties?status=archived',
          active: true,
        },
      ])
    })

    it('includes postcode or address in URLs when provided', () => {
      const result = createPremisesSubNavArr('active', 'NE1')

      expect(result).toEqual([
        {
          text: 'Online properties',
          href: '/properties?status=active&postcodeOrAddress=NE1',
          active: true,
        },
        {
          text: 'Archived properties',
          href: '/properties?status=archived&postcodeOrAddress=NE1',
          active: false,
        },
      ])
    })
  })

  describe('getStatusDisplayName', () => {
    it('returns "Online" for active status', () => {
      expect(getStatusDisplayName('active')).toEqual('Online')
    })

    it('returns "Archived" for archived status', () => {
      expect(getStatusDisplayName('archived')).toEqual('Archived')
    })

    it('returns "List of" for undefined status', () => {
      expect(getStatusDisplayName(undefined)).toEqual('List of')
    })
  })

  describe('getSearchLabel', () => {
    it('returns "Find an online property" for active status', () => {
      expect(getSearchLabel('active')).toEqual('Find an online property')
    })

    it('returns "Find an archived property" for archived status', () => {
      expect(getSearchLabel('archived')).toEqual('Find an archived property')
    })

    it('returns "Find a property" for undefined status', () => {
      expect(getSearchLabel(undefined)).toEqual('Find a property')
    })
  })
})
