import { LocalAuthorityArea, ProbationDeliveryUnit, ProbationRegion } from '@approved-premises/api'
import { stubFor } from '.'

const stubLocalAuthorities = (localAuthorities: Array<LocalAuthorityArea>) =>
  stubFor({
    request: {
      method: 'GET',
      url: '/reference-data/local-authority-areas',
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
      url: `/reference-data/probation-delivery-units${args.probationRegionId ? `?probationRegionId=${args.probationRegionId}` : ''}`,
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
      url: '/reference-data/probation-regions',
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
