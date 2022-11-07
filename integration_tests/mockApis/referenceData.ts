import { SuperAgentRequest } from 'superagent'
import { stubFor } from '../../wiremock'
import { cancellationReasons, characteristics, localAuthorities } from '../../wiremock/referenceDataStubs'

export default {
  stubCancellationReferenceData: (): SuperAgentRequest => stubFor(cancellationReasons),
  stubCharacteristicsReferenceData: (): SuperAgentRequest => stubFor(characteristics),
  stubLocalAuthoritiesReferenceData: (): SuperAgentRequest => stubFor(localAuthorities),
}
