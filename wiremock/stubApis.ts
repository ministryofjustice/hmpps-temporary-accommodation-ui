/* eslint-disable no-console */
import { stubFor } from './index'

import premises from './stubs/premises.json'
import BookingFactory from '../server/testutils/factories/booking'
import arrivalFactory from '../server/testutils/factories/arrival'

const stubs = []

stubs.push(async () =>
  stubFor({
    request: {
      method: 'GET',
      url: '/premises',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: premises,
    },
  }),
)

premises.forEach(p => {
  stubs.push(async () =>
    stubFor({
      request: {
        method: 'GET',
        url: `/premises/${p.id}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: p,
      },
    }),
  )
})

stubs.push(async () =>
  stubFor({
    request: {
      method: 'POST',
      url: `/premises/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/booking/new`,
    },
    response: {
      status: 201,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      body: BookingFactory.build(),
    },
  }),
)

stubs.push(async () =>
  stubFor({
    request: {
      method: 'POST',
      urlPathPattern:
        '/premises/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/bookings/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/arrivals',
    },
    response: {
      status: 201,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: arrivalFactory.build(),
    },
  }),
)

console.log('Stubbing APIs')

stubs.forEach(s =>
  s().then(response => {
    console.log(
      `Stubbed ${response.body.request.method} ${response.body.request.url || response.body.request.urlPathPattern}`,
    )
  }),
)
