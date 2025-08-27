import { createSubNavArr } from './premisesSearchUtils'
import paths from '../paths/temporary-accommodation/manage'
import { assessmentFactory, placeContextFactory } from '../testutils/factories'

describe('premisesSearchUtils', () => {
  describe('createSubNavArr', () => {
    const placeContext = placeContextFactory.build({
      assessment: assessmentFactory.build(),
    })
    it('returns sub nav with given status selected', () => {
      const subNavArr = [
        {
          text: 'Online properties',
          href: `${paths.premises.online({})}?placeContextAssessmentId=${placeContext.assessment.id}&placeContextArrivalDate=${placeContext.arrivalDate}`,
          active: true,
        },
        {
          text: 'Archived properties',
          href: `${paths.premises.archived({})}?placeContextAssessmentId=${placeContext.assessment.id}&placeContextArrivalDate=${placeContext.arrivalDate}`,
          active: false,
        },
      ]

      expect(createSubNavArr('online', placeContext)).toEqual(subNavArr)
    })

    it('returns sub nav with archived status selected', () => {
      const subNavArr = [
        {
          text: 'Online properties',
          href: `${paths.premises.online({})}?placeContextAssessmentId=${placeContext.assessment.id}&placeContextArrivalDate=${placeContext.arrivalDate}`,
          active: false,
        },
        {
          text: 'Archived properties',
          href: `${paths.premises.archived({})}?placeContextAssessmentId=${placeContext.assessment.id}&placeContextArrivalDate=${placeContext.arrivalDate}`,
          active: true,
        },
      ]

      expect(createSubNavArr('archived', placeContext)).toEqual(subNavArr)
    })

    it('appends the postcode or address parameter if given', () => {
      const subNavArr = [
        {
          text: 'Online properties',
          href: `${paths.premises.online({})}?postcodeOrAddress=NE1&placeContextAssessmentId=${placeContext.assessment.id}&placeContextArrivalDate=${placeContext.arrivalDate}`,
          active: true,
        },
        {
          text: 'Archived properties',
          href: `${paths.premises.archived({})}?postcodeOrAddress=NE1&placeContextAssessmentId=${placeContext.assessment.id}&placeContextArrivalDate=${placeContext.arrivalDate}`,
          active: false,
        },
      ]

      expect(createSubNavArr('online', placeContext, 'NE1')).toEqual(subNavArr)
    })
  })
})
