import paths from '../paths/temporary-accommodation/manage'
import { cas3PremisesFactory } from '../testutils/factories'
import { premisesActions } from './premisesV2Utils'

describe('premisesV2Utils', () => {
  describe('premisesActions', () => {
    it('returns actions for an online premises', () => {
      const premises = cas3PremisesFactory.build({ status: 'online' })
      const actions = premisesActions(premises)

      expect(actions).toEqual([
        {
          text: 'Add a bedspace',
          classes: 'govuk-button--secondary',
          href: paths.premises.v2.bedspaces.new({ premisesId: premises.id }),
        },
        {
          text: 'Edit property details',
          classes: 'govuk-button--secondary',
          href: paths.premises.v2.edit({ premisesId: premises.id }),
        },
      ])
    })

    it('returns actions for an archived premises', () => {
      const premises = cas3PremisesFactory.build({ status: 'archived' })
      const actions = premisesActions(premises)

      expect(actions).toEqual([
        {
          text: 'Edit property details',
          classes: 'govuk-button--secondary',
          href: paths.premises.v2.edit({ premisesId: premises.id }),
        },
      ])
    })
  })
})
