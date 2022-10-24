import paths from '../server/paths/temporary-accommodation/api'
import localAuthorityFactory from '../server/testutils/factories/localAuthority'

export const localAuthorities = localAuthorityFactory.buildList(20)

export const localAuthorityStubs = [
  {
    request: {
      method: 'GET',
      url: paths.localAuthorities.index({}),
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: localAuthorities,
    },
  },
]
