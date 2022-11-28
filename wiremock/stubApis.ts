/* eslint-disable no-console */
import { DeepPartial } from 'fishery'

import type { ApprovedPremises } from '@approved-premises/api'
import { bulkStub } from './index'

import premisesJson from './stubs/premises.json'
import bookingFactory from '../server/testutils/factories/booking'
import bedFactory from '../server/testutils/factories/bed'
import premisesFactory from '../server/testutils/factories/premises'

import bookingStubs from './bookingStubs'
import boookingExtensionStubs from './bookingExtensionStubs'
import arrivalStubs from './arrivalStubs'
import nonArrivalStubs from './nonArrivalStubs'
import departureStubs from './departuresStubs'
import cancellationStubs from './cancellationStubs'
import lostBedStubs from './lostBedStubs'
import personStubs from './personStubs'
import applicationStubs from './applicationStubs'
import roomStubs from './roomStub'

import * as referenceDataStubs from './referenceDataStubs'
import dateCapacityFactory from '../server/testutils/factories/dateCapacity'
import staffMemberFactory from '../server/testutils/factories/staffMember'
import { errorStub, getCombinations } from './utils'
import path from '../server/paths/api'
import confirmationStubs from './confirmationStubs'

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

const createRequiredFields = getCombinations(['name', 'addressLine1', 'postcode', 'localAuthorityAreaId', 'status'])

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

  const updateRequiredFields = getCombinations(['addressLine1', 'postcode', 'localAuthorityAreaId', 'status'])

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
    bedspaceBookingFactory.departingToday().buildList(rand()),
    bedspaceBookingFactory.departingSoon().buildList(rand()),
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
})

stubs.push(
  ...bookingStubs,
  ...arrivalStubs,
  ...nonArrivalStubs,
  ...departureStubs,
  ...cancellationStubs,
  ...confirmationStubs,
  ...boookingExtensionStubs,
  ...lostBedStubs,
  ...personStubs,
  ...applicationStubs,
  ...roomStubs,
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
