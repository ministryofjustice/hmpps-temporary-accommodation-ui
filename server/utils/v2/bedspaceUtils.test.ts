import {
  assessmentFactory,
  cas3BedspaceFactory,
  cas3PremisesFactory,
  placeContextFactory,
} from '../../testutils/factories'
import { bedspaceActions } from './bedspaceUtils'
import paths from '../../paths/temporary-accommodation/manage'

describe('bedspaceV2Utils', () => {
  describe('bedspaceActions', () => {
    const placeContext = placeContextFactory.build({
      assessment: assessmentFactory.build({
        accommodationRequiredFromDate: '2025-08-27',
      }),
    })
    it('returns correct actions for an online bedspace', () => {
      const premises = cas3PremisesFactory.build()
      const bedspace = cas3BedspaceFactory.build({ status: 'online', endDate: undefined })

      const actions = bedspaceActions(premises, bedspace, placeContext)

      expect(actions).toHaveLength(4)
      expect(actions).toContainEqual({
        text: 'Book bedspace',
        href: `${paths.bookings.new({ premisesId: premises.id, bedspaceId: bedspace.id })}?placeContextAssessmentId=${placeContext.assessment.id}&placeContextArrivalDate=${placeContext.arrivalDate}`,
        classes: 'govuk-button--secondary',
      })
      expect(actions).toContainEqual({
        text: 'Void bedspace',
        href: paths.lostBeds.new({ premisesId: premises.id, bedspaceId: bedspace.id }),
        classes: 'govuk-button--secondary',
      })
      expect(actions).toContainEqual({
        text: 'Archive bedspace',
        href: paths.premises.bedspaces.archive({ premisesId: premises.id, bedspaceId: bedspace.id }),
        classes: 'govuk-button--secondary',
      })
      expect(actions).toContainEqual({
        text: 'Edit bedspace details',
        href: paths.premises.bedspaces.edit({ premisesId: premises.id, bedspaceId: bedspace.id }),
        classes: 'govuk-button--secondary',
      })
    })

    it('returns correct actions for an online bedspace with scheduled archive', () => {
      const premises = cas3PremisesFactory.build()
      const bedspace = cas3BedspaceFactory.build({ status: 'online', endDate: '2125-08-20' })

      const actions = bedspaceActions(premises, bedspace, placeContext)

      expect(actions).toHaveLength(3)
      expect(actions).toContainEqual({
        text: 'Book bedspace',
        href: `${paths.bookings.new({ premisesId: premises.id, bedspaceId: bedspace.id })}?placeContextAssessmentId=${placeContext.assessment.id}&placeContextArrivalDate=${placeContext.arrivalDate}`,
        classes: 'govuk-button--secondary',
      })
      expect(actions).toContainEqual({
        text: 'Void bedspace',
        href: paths.lostBeds.new({ premisesId: premises.id, bedspaceId: bedspace.id }),
        classes: 'govuk-button--secondary',
      })
      // expect(actions).toContainEqual({
      //   text: 'Cancel scheduled bedspace archive',
      //   href: paths.premises.bedspaces.cancelArchive({ premisesId: premises.id, bedspaceId: bedspace.id }),
      //   classes: 'govuk-button--secondary',
      // })
      expect(actions).toContainEqual({
        text: 'Edit bedspace details',
        href: paths.premises.bedspaces.edit({ premisesId: premises.id, bedspaceId: bedspace.id }),
        classes: 'govuk-button--secondary',
      })
    })

    it('returns correct actions for an archived bedspace', () => {
      const premises = cas3PremisesFactory.build()
      const bedspace = cas3BedspaceFactory.build({ status: 'archived' })

      const actions = bedspaceActions(premises, bedspace, placeContext)

      expect(actions).toHaveLength(2)
      expect(actions).toContainEqual({
        text: 'Make bedspace online',
        href: paths.premises.bedspaces.unarchive({ premisesId: premises.id, bedspaceId: bedspace.id }),
        classes: 'govuk-button--secondary',
      })
      expect(actions).toContainEqual({
        text: 'Edit bedspace details',
        href: paths.premises.bedspaces.edit({ premisesId: premises.id, bedspaceId: bedspace.id }),
        classes: 'govuk-button--secondary',
      })
    })

    it('returns correct actions for an upcoming new bedspace', () => {
      const premises = cas3PremisesFactory.build()
      const bedspace = cas3BedspaceFactory.build({
        status: 'upcoming',
        archiveHistory: [],
      })

      const actions = bedspaceActions(premises, bedspace, placeContext)

      expect(actions).toHaveLength(1)
      expect(actions).toContainEqual({
        text: 'Edit bedspace details',
        href: paths.premises.bedspaces.edit({ premisesId: premises.id, bedspaceId: bedspace.id }),
        classes: 'govuk-button--secondary',
      })
    })

    it('returns correct actions for an upcoming bedspace that was previously archived', () => {
      const premises = cas3PremisesFactory.build()
      const bedspace = cas3BedspaceFactory.build({
        status: 'upcoming',
        archiveHistory: [
          {
            date: '2024-01-01',
            status: 'archived',
          },
        ],
      })

      const actions = bedspaceActions(premises, bedspace, placeContext)

      expect(actions).toHaveLength(1)
      // expect(actions).toContainEqual({
      //   text: 'Cancel scheduled bedspace online date',
      //   href: paths.premises.bedspaces.cancelArchive({ premisesId: premises.id, bedspaceId: bedspace.id }),
      //   classes: 'govuk-button--secondary',
      // })
      expect(actions).toContainEqual({
        text: 'Edit bedspace details',
        href: paths.premises.bedspaces.edit({ premisesId: premises.id, bedspaceId: bedspace.id }),
        classes: 'govuk-button--secondary',
      })
    })
  })
})
