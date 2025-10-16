import paths from '../paths/temporary-accommodation/manage'
import { assessmentFactory, cas3PremisesFactory, placeContextFactory } from '../testutils/factories'
import { premisesActions, shortAddress, showPropertySubNavArray } from './premisesUtils'

describe('premisesUtils', () => {
  const placeContext = placeContextFactory.build({
    assessment: assessmentFactory.build({
      accommodationRequiredFromDate: '2025-08-27',
    }),
  })
  describe('premisesActions', () => {
    it('returns add a bedspace for an active premises', () => {
      const premises = cas3PremisesFactory.build({ status: 'online' })

      expect(premisesActions(premises)).toEqual([
        {
          text: 'Add a bedspace',
          classes: 'govuk-button--secondary',
          href: paths.premises.bedspaces.new({ premisesId: premises.id }),
        },
      ])
    })

    it('returns null for an archived premises', () => {
      const premises = cas3PremisesFactory.build({ status: 'archived' })

      expect(premisesActions(premises)).toEqual(null)
    })
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
})
