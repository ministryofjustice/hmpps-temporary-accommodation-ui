import { LocalAuthorityArea, ProbationDeliveryUnit, ProbationRegion } from '@approved-premises/api'
import { stubFor } from '.'
import paths from '../../server/paths/api'

const stubLocalAuthorities = (localAuthorities: Array<LocalAuthorityArea>) =>
  stubFor({
    request: {
      method: 'GET',
      url: paths.referenceData({ objectType: 'local-authority-areas' }),
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: localAuthorities,
    },
  })

const stubPdus = (args: { pdus: Array<ProbationDeliveryUnit>; probationRegionId?: string }) =>
  stubFor({
    request: {
      method: 'GET',
      urlPath: paths.referenceData({
        objectType: 'probation-delivery-units',
      }),
      queryParameters: {
        probationRegionId: args.probationRegionId ? { equalTo: args.probationRegionId } : undefined,
      },
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: args.pdus,
    },
  })

const stubProbationRegions = (regions: Array<ProbationRegion>) =>
  stubFor({
    request: {
      method: 'GET',
      url: paths.referenceData({ objectType: 'probation-regions' }),
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: regions,
    },
  })

export default {
  stubLocalAuthorities,
  stubPdus,
  stubProbationRegions,
}
