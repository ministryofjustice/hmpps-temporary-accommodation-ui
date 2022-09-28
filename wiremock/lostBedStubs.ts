import { guidRegex } from './index'
import lostBedFactory from '../server/testutils/factories/lostBed'
import { errorStub, getCombinations } from './utils'

const lostBeds: Array<Record<string, unknown>> = []

lostBeds.push({
  priority: 99,
  request: {
    method: 'POST',
    urlPathPattern: `/premises/${guidRegex}/lost-beds`,
  },
  response: {
    status: 201,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    },
    jsonBody: JSON.stringify(lostBedFactory.build()),
  },
})
const requiredFields = getCombinations(['startDate', 'endDate', 'numberOfBeds', 'reason', 'referenceNumber'])

requiredFields.forEach((fields: Array<string>) => {
  lostBeds.push(errorStub(fields, `/premises/${guidRegex}/lost-beds`))
})

export default lostBeds
