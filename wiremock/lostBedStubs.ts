import paths from '../server/paths/api'
import { lostBedCancellationFactory, lostBedFactory } from '../server/testutils/factories'
import { guidRegex } from './index'
import { errorStub, getCombinations } from './utils'

const lostBeds: Array<Record<string, unknown>> = []

lostBeds.push({
  priority: 99,
  request: {
    method: 'POST',
    urlPathPattern: paths.premises.lostBeds.create({ premisesId: guidRegex }),
  },
  response: {
    status: 201,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    },
    jsonBody: lostBedFactory.build(),
  },
})

lostBeds.push({
  priority: 99,
  request: {
    method: 'GET',
    urlPathPattern: paths.premises.lostBeds.show({ premisesId: guidRegex, lostBedId: guidRegex }),
  },
  response: {
    status: 200,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    },
    jsonBody: lostBedFactory.active().build(),
  },
})

lostBeds.push({
  priority: 99,
  request: {
    method: 'GET',
    urlPathPattern: paths.premises.lostBeds.index({ premisesId: guidRegex }),
  },
  response: {
    status: 200,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    },
    jsonBody: lostBedFactory.buildList(5),
  },
})

lostBeds.push({
  priority: 99,
  request: {
    method: 'PUT',
    urlPathPattern: paths.premises.lostBeds.update({ premisesId: guidRegex, lostBedId: guidRegex }),
  },
  response: {
    status: 200,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    },
    jsonBody: lostBedFactory.build(),
  },
})

lostBeds.push({
  priority: 99,
  request: {
    method: 'POST',
    urlPathPattern: paths.premises.lostBeds.cancel({ premisesId: guidRegex, lostBedId: guidRegex }),
  },
  response: {
    status: 201,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    },
    jsonBody: lostBedCancellationFactory.build(),
  },
})

lostBeds.push({
  priority: 99,
  request: {
    method: 'GET',
    urlPathPattern: paths.premises.lostBeds.update({ premisesId: guidRegex, lostBedId: guidRegex }),
  },
  response: {
    status: 200,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    },
    jsonBody: lostBedFactory.active().build(),
  },
})

const requiredFields = getCombinations(['startDate', 'endDate', 'bedId', 'reason', 'serviceName'])

requiredFields.forEach((fields: Array<string>) => {
  lostBeds.push(errorStub(fields, paths.premises.lostBeds.create({ premisesId: guidRegex }), 'POST'))
  lostBeds.push(
    errorStub(
      fields,
      paths.premises.lostBeds.update({
        premisesId: guidRegex,
        lostBedId: guidRegex,
      }),
      'PUT',
    ),
  )
})

export default lostBeds
