import { createMockRequest } from '../testutils/createMockRequest'
import probationRegionFactory from '../testutils/factories/probationRegion'
import filterProbationRegions from './userUtils'

describe('filterProbationRegions', () => {
  it('filters given probation regions by the region on the request session', () => {
    const nonUserRegion1 = probationRegionFactory.build({
      id: 'some-non-user-region-1',
    })
    const nonUserRegion2 = probationRegionFactory.build({
      id: 'some-non-user-region-2',
    })
    const userRegion = probationRegionFactory.build({
      id: 'user-region',
    })

    const request = createMockRequest()

    request.session.actingUserProbationRegion = probationRegionFactory.build({ id: 'user-region' })

    expect(filterProbationRegions([nonUserRegion1, userRegion, nonUserRegion2], request)).toEqual([userRegion])
  })
})
