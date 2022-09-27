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

const errorStub = (fields: Array<string>, pattern: string, nullifiedFields: Array<string> = []) => {
  const bodyPatterns = fields.map(field => {
    if (nullifiedFields.includes(field)) {
      return {
        matchesJsonPath: {
          expression: `$.${field}`,
          absent: '(absent)',
        },
      }
    }
    return {
      matchesJsonPath: `$.[?(@.${field} === '')]`,
    }
  })

  const invalidParams = fields.map(field => {
    return {
      propertyName: `$.${field}`,
      errorType: 'blank',
    }
  })

  return {
    request: {
      method: 'POST',
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

export { getCombinations, errorStub }
