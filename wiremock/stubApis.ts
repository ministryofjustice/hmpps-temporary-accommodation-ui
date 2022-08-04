/* eslint-disable no-console */
import { stubFor, guidRegex } from './index'

import premises from './stubs/premises.json'
import bookingFactory from '../server/testutils/factories/booking'

import bookingStubs from './bookingStubs'
import arrivalStubs from './arrivalStubs'
import nonArrivalStubs from './nonArrivalStubs'
import departureFactory from '../server/testutils/factories/departure'

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

  const rand = () => Math.floor(Math.random() * 10)

  const bookings = [
    bookingFactory.arrivingToday().buildList(rand()),
    bookingFactory.arrivedToday().buildList(rand()),
    bookingFactory.departingToday().buildList(rand()),
    bookingFactory.departedToday().buildList(rand()),
    bookingFactory.arrivingSoon().buildList(rand()),
    bookingFactory.cancelledWithFutureArrivalDate().buildList(rand()),
    bookingFactory.departingSoon().buildList(rand()),
  ].flat()

  stubs.push(async () =>
    stubFor({
      request: {
        method: 'GET',
        url: `/premises/${p.id}/bookings`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        body: JSON.stringify(bookings),
      },
    }),
  )
})

stubs.push(async () =>
  stubFor({
    request: {
      method: 'GET',
      urlPathPattern: `/premises/${guidRegex}/bookings/${guidRegex}`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      body: JSON.stringify(bookingFactory.build()),
    },
  }),
)

stubs.push(...bookingStubs, ...arrivalStubs, ...nonArrivalStubs)

stubs.push(async () =>
  stubFor({
    request: {
      method: 'POST',
      urlPathPattern: `/premises/${guidRegex}/bookings/${guidRegex}/departures`,
    },
    response: {
      status: 201,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      body: JSON.stringify(departureFactory.build()),
    },
  }),
)

stubs.push(async () =>
  stubFor({
    request: {
      method: 'GET',
      urlPathPattern: `/premises/${guidRegex}/bookings/${guidRegex}/departures/${guidRegex}`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      body: JSON.stringify(departureFactory.build()),
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
