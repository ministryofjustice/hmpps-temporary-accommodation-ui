import { cas3BedspaceFactory, cas3PremisesFactory } from '../../testutils/factories'
import { bedspaceActions } from './bedspaceUtils'
import paths from '../../paths/temporary-accommodation/manage'

describe('bedspaceV2Utils', () => {
  describe('bedspaceActions', () => {
    it('returns "Edit bedspace details" for a bedspace', () => {
      const premises = cas3PremisesFactory.build()
      const bedspace = cas3BedspaceFactory.build()

      const actions = bedspaceActions(premises, bedspace)

      expect(actions).toContainEqual({
        text: 'Edit bedspace details',
        href: paths.premises.v2.bedspaces.edit({ premisesId: premises.id, bedspaceId: bedspace.id }),
        classes: 'govuk-button--secondary',
      })
    })
  })
})
