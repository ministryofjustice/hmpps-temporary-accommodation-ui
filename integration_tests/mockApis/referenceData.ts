import { LocalAuthorityArea } from '../../server/@types/shared/models/LocalAuthorityArea'
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

export default {
  stubLocalAuthorities,
}
