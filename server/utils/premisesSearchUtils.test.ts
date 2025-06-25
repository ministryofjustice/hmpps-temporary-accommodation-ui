import { createSubNavArr } from './premisesSearchUtils'
import paths from '../paths/temporary-accommodation/manage'

describe('premisesSearchUtils', () => {
  describe('createSubNavArr', () => {
    it('returns sub nav with given status selected', () => {
      const subNavArr = [
        {
          text: 'Online properties',
          href: paths.premises.v2.online({}),
          active: true,
        },
        {
          text: 'Archived properties',
          href: paths.premises.v2.archived({}),
          active: false,
        },
      ]

      expect(createSubNavArr('online')).toEqual(subNavArr)
    })

    it('returns sub nav with archived status selected', () => {
      const subNavArr = [
        {
          text: 'Online properties',
          href: paths.premises.v2.online({}),
          active: false,
        },
        {
          text: 'Archived properties',
          href: paths.premises.v2.archived({}),
          active: true,
        },
      ]

      expect(createSubNavArr('archived')).toEqual(subNavArr)
    })

    it('appends the postcode or address parameter if given', () => {
      const subNavArr = [
        {
          text: 'Online properties',
          href: `${paths.premises.v2.online({})}?postcodeOrAddress=NE1`,
          active: true,
        },
        {
          text: 'Archived properties',
          href: `${paths.premises.v2.archived({})}?postcodeOrAddress=NE1`,
          active: false,
        },
      ]

      expect(createSubNavArr('online', 'NE1')).toEqual(subNavArr)
    })
  })
})
