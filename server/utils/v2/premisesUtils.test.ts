import paths from '../../paths/temporary-accommodation/manage'
import { cas3PremisesBedspaceTotalsFactory, cas3PremisesFactory } from '../../testutils/factories'
import { isPremiseScheduledToBeArchived, premisesActions } from './premisesUtils'
import config from '../../config'

jest.mock('../../config')

describe('premisesV2Utils', () => {
  config.flags.cancelScheduledArchiveEnabled = true

  describe('premisesActions', () => {
    it('returns actions for an online premises without scheduled archive', () => {
      const premises = cas3PremisesFactory.build({ status: 'online', endDate: null })
      const actions = premisesActions(premises)

      expect(actions).toEqual([
        {
          text: 'Add a bedspace',
          classes: 'govuk-button--secondary',
          href: paths.premises.bedspaces.new({ premisesId: premises.id }),
        },
        {
          text: 'Archive property',
          classes: 'govuk-button--secondary',
          href: paths.premises.archive({ premisesId: premises.id }),
        },
        {
          text: 'Edit property details',
          classes: 'govuk-button--secondary',
          href: paths.premises.edit({ premisesId: premises.id }),
        },
      ])
    })

    it('returns actions for an online premises with scheduled archive', () => {
      const premises = cas3PremisesFactory.build({ status: 'online', endDate: '2025-12-31' })
      const actions = premisesActions(premises)

      expect(actions).toEqual([
        {
          text: 'Add a bedspace',
          classes: 'govuk-button--secondary',
          href: paths.premises.bedspaces.new({ premisesId: premises.id }),
        },
        {
          text: 'Cancel scheduled property archive',
          classes: 'govuk-button--secondary',
          href: paths.premises.cancelArchive({ premisesId: premises.id }),
        },
        {
          text: 'Edit property details',
          classes: 'govuk-button--secondary',
          href: paths.premises.edit({ premisesId: premises.id }),
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
          href: paths.premises.edit({ premisesId: premises.id }),
        },
        {
          text: 'Make property online',
          classes: 'govuk-button--secondary',
          href: paths.premises.unarchive({ premisesId: premises.id }),
        },
      ])
    })
  })

  describe('isPremiseScheduledToBeArchived', () => {
    it('returns false when premisesEndDate is null', () => {
      const totals = cas3PremisesBedspaceTotalsFactory.build({ premisesEndDate: null })

      expect(isPremiseScheduledToBeArchived(totals)).toBe(false)
    })

    it('returns false when premisesEndDate is undefined', () => {
      const totals = cas3PremisesBedspaceTotalsFactory.build()
      totals.premisesEndDate = undefined

      expect(isPremiseScheduledToBeArchived(totals)).toBe(false)
    })

    it('returns false when premisesEndDate is in the past', () => {
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 1)
      const totals = cas3PremisesBedspaceTotalsFactory.build({
        premisesEndDate: pastDate.toISOString(),
        status: 'online',
      })

      expect(isPremiseScheduledToBeArchived(totals)).toBe(false)
    })

    it('returns false when premises is already archived', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 1)
      const totals = cas3PremisesBedspaceTotalsFactory.build({
        premisesEndDate: futureDate.toISOString(),
        status: 'archived',
      })

      expect(isPremiseScheduledToBeArchived(totals)).toBe(false)
    })

    it('returns true when premisesEndDate is in the future and status is online', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 1)
      const totals = cas3PremisesBedspaceTotalsFactory.build({
        premisesEndDate: futureDate.toISOString(),
        status: 'online',
      })

      expect(isPremiseScheduledToBeArchived(totals)).toBe(true)
    })
  })
})
