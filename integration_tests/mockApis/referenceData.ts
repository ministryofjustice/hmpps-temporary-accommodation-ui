import { SuperAgentRequest } from 'superagent'
import { stubFor } from '../../wiremock'
import { cancellationReasons } from '../../wiremock/referenceDataStubs'

export default {
  stubCancellationReferenceData: (): SuperAgentRequest => stubFor(cancellationReasons),
}
