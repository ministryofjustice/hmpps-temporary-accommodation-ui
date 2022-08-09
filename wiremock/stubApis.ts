/* eslint-disable no-console */
import { bulkStub } from './index'

import premises from './stubs/premises.json'
import bookingFactory from '../server/testutils/factories/booking'

import bookingStubs from './bookingStubs'
import arrivalStubs from './arrivalStubs'
import nonArrivalStubs from './nonArrivalStubs'
import departureStubs from './departuresStubs'
import * as referenceDataStubs from './referenceDataStubs'

const stubs = []

stubs.push({
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
})

premises.forEach(p => {
  stubs.push({
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
  })

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

  stubs.push({
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
  })

  bookings.forEach(booking => {
    stubs.push({
      request: {
        method: 'GET',
        url: `/premises/${p.id}/bookings/${booking.id}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        body: JSON.stringify(booking),
      },
    })
  })
})

stubs.push(
  ...bookingStubs,
  ...arrivalStubs,
  ...nonArrivalStubs,
  ...departureStubs,
  ...Object.values(referenceDataStubs),
)

console.log('Stubbing APIs')

bulkStub({
  mappings: stubs,
  importOptions: {
    duplicatePolicy: 'IGNORE',
    deleteAllNotInImport: true,
  },
}).then(_response => {
  console.log('Done!')
  process.exit(0)
})
