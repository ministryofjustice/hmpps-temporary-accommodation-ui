import { LostBed } from '../server/@types/shared'

const getCombinations = (arr: Array<string>) => {
  const result: Array<Array<string>> = []
  arr.forEach(item => {
    result.push([item])
    const index = arr.indexOf(item) + 1
    for (let i = index; i < arr.length; i += 1) {
      const group = [item, ...arr.slice(index, i + 1)]
      result.push(group)
    }
  })
  return result.sort((a, b) => b.length - a.length)
}

const errorStub = (fields: Array<string>, pattern: string, method: string) => {
  const bodyPatterns = fields.map(field => {
    return {
      matchesJsonPath: {
        expression: `$.${field}`,
        absent: '(absent)',
      },
    }
  })

  const invalidParams = fields.map(field => {
    return {
      propertyName: `$.${field}`,
      errorType: 'empty',
    }
  })

  return {
    request: {
      method,
      urlPathPattern: pattern,
      bodyPatterns,
    },
    response: {
      status: 400,
      headers: {
        'Content-Type': 'application/problem+json;charset=UTF-8',
      },
      jsonBody: {
        type: 'https://example.net/validation-error',
        title: 'Invalid request parameters',
        code: 400,
        'invalid-params': invalidParams,
      },
    },
  }
}

const bedspaceConflictResponseBody = (
  entityId: string | LostBed,
  entityType: 'booking' | 'lost-bed' | 'bedspace-end-date',
) => {
  let detail: string

  if (entityType === 'bedspace-end-date') {
    detail = 'BedSpace is archived from 2024-06-06 which overlaps with the desired dates'
  } else {
    detail = `${entityType === 'booking' ? 'Booking' : 'Lost Bed'}: ${entityId}`
  }

  return {
    title: 'Conflict',
    status: 409,
    detail,
  }
}

export { getCombinations, errorStub, bedspaceConflictResponseBody }
