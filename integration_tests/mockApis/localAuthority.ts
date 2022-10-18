import type { SuperAgentRequest } from 'superagent'

import type { LocalAuthority } from '@approved-premises/ui'
import { stubFor } from '../../wiremock'
import paths from '../../server/paths/temporary-accommodation/api'

const stubLocalAuthorities = (localAuthorities: LocalAuthority[]): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      url: paths.localAuthorities.index({}),
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: localAuthorities,
    },
  })

export default {
  stubLocalAuthorities,
}
