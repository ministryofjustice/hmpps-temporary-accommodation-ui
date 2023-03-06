/* eslint-disable no-console */
import { DeepPartial } from 'fishery'

import type { ApprovedPremises } from '@approved-premises/api'
import { bulkStub } from './index'

import bedFactory from '../server/testutils/factories/bed'
import bookingFactory from '../server/testutils/factories/booking'
import premisesFactory from '../server/testutils/factories/premises'
import premisesJson from './stubs/premises.json'
import lostBedFactory from '../server/testutils/factories/lostBed'

import applicationStubs from './applicationStubs'
import arrivalStubs from './arrivalStubs'
import bookingStubs from './bookingStubs'
import cancellationStubs from './cancellationStubs'
import departureStubs from './departuresStubs'
import extensionStubs from './extensionStubs'
import lostBedStubs from './lostBedStubs'
import nonArrivalStubs from './nonArrivalStubs'
import personStubs from './personStubs'
import roomStubs from './roomStub'
import userStub from './userStub'

import path from '../server/paths/api'
import dateCapacityFactory from '../server/testutils/factories/dateCapacity'
import staffMemberFactory from '../server/testutils/factories/staffMember'
import confirmationStubs from './confirmationStubs'
import oasysSectionsStubs from './oasysSectionsStubs'
import oasysSelectionStubs from './oasysSelectionStubs'
import offenceStubs from './offenceStubs'
import * as referenceDataStubs from './referenceDataStubs'
import reportStubs from './reportStubs'
import { errorStub, getCombinations } from './utils'

const stubs = []

const premises = premisesJson.map(item => {
  return premisesFactory.build({ ...(item as DeepPartial<ApprovedPremises>) })
})

stubs.push({
  request: {
    method: 'GET',
    urlPath: '/premises',
  },
  response: {
    status: 200,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    },
    jsonBody: premises,
  },
})

const createRequiredFields = [...getCombinations(['addressLine1', 'postcode', 'probationRegionId', 'status']), ['pdu']]

createRequiredFields.forEach((fields: Array<string>) => {
  stubs.push(errorStub(fields, `/premises`, 'POST'))
})

stubs.push({
  request: {
    method: 'POST',
    url: '/premises',
  },
  response: {
    status: 201,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    },
    jsonBody: premises[0],
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

  stubs.push({
    request: {
      method: 'GET',
      url: `/premises/${item.id}/capacity`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: dateCapacityFactory.buildList(5),
    },
  })

  stubs.push({
    request: {
      method: 'GET',
      url: `/premises/${item.id}/staff`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: staffMemberFactory.buildList(10),
    },
  })

  const updateRequiredFields = [
    ...getCombinations(['addressLine1', 'postcode', 'probationRegionId', 'status']),
    ['pdu'],
  ]

  updateRequiredFields.forEach((fields: Array<string>) => {
    stubs.push(errorStub(fields, path.premises.update({ premisesId: item.id }), 'PUT'))
  })

  stubs.push({
    request: {
      method: 'PUT',
      url: path.premises.update({ premisesId: item.id }),
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: item,
    },
  })

  const rand = () => Math.floor(1 + Math.random() * 2)

  const bedspaceBookingFactory = bookingFactory.params({
    bed: bedFactory.build({
      id: 'bedId',
    }),
  })

  const bookings = [
    bedspaceBookingFactory.provisional().buildList(rand()),
    bedspaceBookingFactory.confirmed().buildList(rand()),
    bedspaceBookingFactory.arrived().buildList(rand()),
    bedspaceBookingFactory.departed().buildList(rand()),
    bedspaceBookingFactory.cancelled().buildList(rand()),
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
      jsonBody: bookings,
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
        jsonBody: booking,
      },
    })
  })

  const bedspaceLostBedFactory = lostBedFactory.params({
    bedId: 'bedId',
  })

  const lostBeds = [
    bedspaceLostBedFactory.active().buildList(rand()),
    bedspaceLostBedFactory.cancelled().buildList(rand()),
    bedspaceLostBedFactory.past().buildList(rand()),
  ].flat()

  stubs.push({
    request: {
      method: 'GET',
      url: `/premises/${item.id}/lost-beds`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: lostBeds,
    },
  })

  lostBeds.forEach(lostBed => {
    stubs.push({
      request: {
        method: 'GET',
        url: `/premises/${item.id}/lost-beds/${lostBed.id}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: lostBed,
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
  ...confirmationStubs,
  ...extensionStubs,
  ...lostBedStubs,
  ...personStubs,
  ...applicationStubs,
  ...roomStubs,
  ...userStub,
  ...reportStubs,
  ...offenceStubs,
  ...oasysSelectionStubs,
  ...oasysSectionsStubs,
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
