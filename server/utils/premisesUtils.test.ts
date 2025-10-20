import {
  assessmentFactory,
  cas3PremisesBedspaceTotalsFactory,
  cas3PremisesFactory,
  placeContextFactory,
} from '../testutils/factories'
import { isPremiseScheduledToBeArchived, premisesActions, shortAddress, showPropertySubNavArray } from './premisesUtils'
import paths from '../paths/temporary-accommodation/manage'
import config from '../config'

describe('premisesUtils', () => {
  const configOriginalFlags = config.flags

  afterEach(() => {
    config.flags = configOriginalFlags
  })

  const placeContext = placeContextFactory.build({
    assessment: assessmentFactory.build({
      accommodationRequiredFromDate: '2025-08-27',
    }),
  })

  describe('shortAddress', () => {
    it('returns a shortened address for the premises when it does not have a town', () => {
      const premises = cas3PremisesFactory.build({
        addressLine1: '123 Road Lane',
        postcode: 'ABC 123',
      })
      premises.town = undefined

      expect(shortAddress(premises)).toEqual('123 Road Lane, ABC 123')
    })

    it('returns a shortened address for the premises when it does have a town', () => {
      const premises = cas3PremisesFactory.build({
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
          href: `/properties/83b4062f-963e-450d-b912-589eab7ca91c?placeContextAssessmentId=${placeContext.assessment.id}&placeContextArrivalDate=${placeContext.arrivalDate}`,
          active: true,
        },
        {
          text: 'Bedspaces overview',
          href: `/properties/83b4062f-963e-450d-b912-589eab7ca91c/bedspaces?placeContextAssessmentId=${placeContext.assessment.id}&placeContextArrivalDate=${placeContext.arrivalDate}`,
          active: false,
        },
      ]

      const result = showPropertySubNavArray('83b4062f-963e-450d-b912-589eab7ca91c', placeContext, 'premises')

      expect(result).toEqual(expectedResult)
    })

    it('returns the sub nav array for the bedspaces tab', () => {
      const expectedResult = [
        {
          text: 'Property overview',
          href: `/properties/6a2fc984-8cdd-4eef-8736-cc74f845ee47?placeContextAssessmentId=${placeContext.assessment.id}&placeContextArrivalDate=${placeContext.arrivalDate}`,
          active: false,
        },
        {
          text: 'Bedspaces overview',
          href: `/properties/6a2fc984-8cdd-4eef-8736-cc74f845ee47/bedspaces?placeContextAssessmentId=${placeContext.assessment.id}&placeContextArrivalDate=${placeContext.arrivalDate}`,
          active: true,
        },
      ]

      const result = showPropertySubNavArray('6a2fc984-8cdd-4eef-8736-cc74f845ee47', placeContext, 'bedspaces')

      expect(result).toEqual(expectedResult)
    })
  })

  describe('premisesActions', () => {
    beforeEach(() => {
      config.flags.cancelScheduledArchiveEnabled = true
    })

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

    it('returns actions for an archived premises with scheduled unarchive', () => {
      const premises = cas3PremisesFactory.build({ status: 'archived', scheduleUnarchiveDate: '2025-12-31' })
      const actions = premisesActions(premises)

      expect(actions).toEqual([
        {
          text: 'Cancel scheduled property online date',
          classes: 'govuk-button--secondary',
          href: paths.premises.cancelUnarchive({ premisesId: premises.id }),
        },
        {
          text: 'Edit property details',
          classes: 'govuk-button--secondary',
          href: paths.premises.edit({ premisesId: premises.id }),
        },
      ])
    })

    it('returns actions for an archived premises', () => {
      const premises = cas3PremisesFactory.build({ status: 'archived', scheduleUnarchiveDate: null })
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
