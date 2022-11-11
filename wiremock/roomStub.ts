import { guidRegex } from './index'
import roomFactory from '../server/testutils/factories/room'
import { errorStub, getCombinations } from './utils'

const rooms: Array<Record<string, unknown>> = []

rooms.push({
  priority: 99,
  request: {
    method: 'POST',
    urlPathPattern: `/premises/${guidRegex}/rooms`,
  },
  response: {
    status: 201,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    },
    jsonBody: JSON.stringify(roomFactory.build()),
  },
})

const createRequiredFields = getCombinations(['name'])

createRequiredFields.forEach((fields: Array<string>) => {
  rooms.push(errorStub(fields, `/premises/${guidRegex}/rooms`, 'POST'))
})

rooms.push({
  priority: 99,
  request: {
    method: 'GET',
    urlPathPattern: `/premises/${guidRegex}/rooms`,
  },
  response: {
    status: 200,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    },
    jsonBody: roomFactory.buildList(5),
  },
})

rooms.push({
  priority: 99,
  request: {
    method: 'GET',
    urlPathPattern: `/premises/${guidRegex}/rooms/${guidRegex}`,
  },
  response: {
    status: 200,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    },
    jsonBody: roomFactory.build(),
  },
})

rooms.push({
  priority: 99,
  request: {
    method: 'PUT',
    urlPathPattern: `/premises/${guidRegex}/rooms/${guidRegex}`,
  },
  response: {
    status: 200,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    },
    jsonBody: roomFactory.build(),
  },
})

const updateRequiredFields = getCombinations([])

updateRequiredFields.forEach((fields: Array<string>) => {
  rooms.push(errorStub(fields, `/premises/${guidRegex}/rooms/${guidRegex}`, 'PUT'))
})

export default rooms
