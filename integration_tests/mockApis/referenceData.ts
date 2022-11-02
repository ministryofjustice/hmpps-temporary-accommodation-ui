import { SuperAgentRequest } from 'superagent'
import { stubFor } from '../../wiremock'
import { cancellationReasons, characteristics } from '../../wiremock/referenceDataStubs'

export default {
  stubCancellationReferenceData: (): SuperAgentRequest => stubFor(cancellationReasons),
  stubCharacteristicsReferenceData: (): SuperAgentRequest => stubFor(characteristics),
}
