/* eslint-disable no-console */
import { DeepPartial } from 'fishery'

import type { TemporaryAccommodationPremises } from '@approved-premises/api'
import { bulkStub } from './index'

import {
  bedFactory,
  bedSearchResultsFactory,
  bookingFactory,
  dateCapacityFactory,
  lostBedFactory,
  premisesFactory,
  premisesSummaryFactory,
  staffMemberFactory,
} from '../server/testutils/factories'
import premisesJson from './stubs/premises.json'

import applicationStubs from './applicationStubs'
import arrivalStubs from './arrivalStubs'
import assessmentStubs from './assessmentStubs'
import bookingStubs from './bookingStubs'
import cancellationStubs from './cancellationStubs'
import departureStubs from './departuresStubs'
import extensionStubs from './extensionStubs'
import lostBedStubs from './lostBedStubs'
import nonArrivalStubs from './nonArrivalStubs'
import personStubs from './personStubs'
import roomStubs from './roomStub'
import turnaroundStubs from './turnaroundStubs'
import userStub from './userStub'

import path from '../server/paths/api'
import acctAlertStubs from './acctAlertStubs'
import adjudicationStubs from './adjudicationStubs'
import confirmationStubs from './confirmationStubs'
import oasysSectionsStubs from './oasysSectionsStubs'
import oasysSelectionStubs from './oasysSelectionStubs'
import offenceStubs from './offenceStubs'
import * as referenceDataStubs from './referenceDataStubs'
import reportStubs from './reportStubs'
import { errorStub, getCombinations } from './utils'

const stubs = []

const premises = premisesJson.map(item => {
  return premisesFactory.build({ ...(item as DeepPartial<TemporaryAccommodationPremises>) })
})

const premisesSummaries = premisesJson.map(item => {
  return premisesSummaryFactory.build({ ...item })
})

stubs.push({
  request: {
    method: 'GET',
    urlPath: '/premises/summary',
  },
  response: {
    status: 200,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    },
    jsonBody: premisesSummaries,
  },
})

const createRequiredFields = [
  ...getCombinations(['addressLine1', 'postcode', 'probationRegionId', 'status']),
  ['probationDeliveryUnitId'],
]

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
    ['probationDeliveryUnitId'],
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
    bedspaceBookingFactory.closed().buildList(rand()),
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

const bedSerchRequiredFields = [...getCombinations(['startDate', 'durationDays', 'probationDeliveryUnit'])]

bedSerchRequiredFields.forEach((fields: Array<string>) => {
  stubs.push(errorStub(fields, path.beds.search({}), 'POST'))
})

stubs.push({
  request: {
    method: 'POST',
    url: path.beds.search({}),
  },
  response: {
    status: 200,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    },
    jsonBody: bedSearchResultsFactory.forPremises(premises).build(),
  },
})

stubs.push(
  ...bookingStubs,
  ...arrivalStubs,
  ...nonArrivalStubs,
  ...departureStubs,
  ...cancellationStubs,
  ...confirmationStubs,
  ...extensionStubs,
  ...turnaroundStubs,
  ...lostBedStubs,
  ...personStubs,
  ...applicationStubs,
  ...assessmentStubs,
  ...roomStubs,
  ...userStub,
  ...reportStubs,
  ...offenceStubs,
  ...oasysSelectionStubs,
  ...oasysSectionsStubs,
  ...acctAlertStubs,
  ...adjudicationStubs,
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
