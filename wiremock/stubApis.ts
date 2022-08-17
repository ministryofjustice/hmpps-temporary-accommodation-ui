/* eslint-disable no-console */
import { DeepPartial } from 'fishery'

import type { Premises } from 'approved-premises'
import { bulkStub } from './index'

import premisesJson from './stubs/premises.json'
import bookingFactory from '../server/testutils/factories/booking'
import premisesFactory from '../server/testutils/factories/premises'

import bookingStubs from './bookingStubs'
import arrivalStubs from './arrivalStubs'
import nonArrivalStubs from './nonArrivalStubs'
import departureStubs from './departuresStubs'
import cancellationStubs from './cancellationStubs'

import * as referenceDataStubs from './referenceDataStubs'

const stubs = []

const premises = premisesJson.map(item => premisesFactory.build(item as DeepPartial<Premises>))

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

premises.forEach(item => {
  stubs.push({
    request: {
      method: 'GET',
      url: `/premises/${item.id}`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: item,
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
      url: `/premises/${item.id}/bookings`,
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
        url: `/premises/${item.id}/bookings/${booking.id}`,
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
  ...cancellationStubs,
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
