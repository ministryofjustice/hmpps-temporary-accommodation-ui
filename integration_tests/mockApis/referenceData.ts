import { LocalAuthorityArea, ProbationDeliveryUnit } from '@approved-premises/api'
import { stubFor } from '../../wiremock'

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

export default {
  stubLocalAuthorities,
  stubPdus,
}
