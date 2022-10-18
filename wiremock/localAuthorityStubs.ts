import paths from '../server/paths/temporary-accommodation/api'
import localAuthorityFactory from '../server/testutils/factories/localAuthority'

export default [
  {
    request: {
      method: 'GET',
      url: paths.localAuthorities.index({}),
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: localAuthorityFactory.buildList(20),
    },
  },
]
