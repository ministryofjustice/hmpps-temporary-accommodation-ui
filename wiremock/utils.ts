const getCombinations = (arr: Array<string>) => {
  const result: Array<Array<string>> = []
  const f = (prefixes: Array<string>, suffixes: Array<string>) => {
    for (let i = 0; i < suffixes.length; i += 1) {
      result.push([...prefixes, suffixes[i]])
      f(
        [...prefixes, suffixes[i]],
        suffixes.filter(suffix => suffixes.indexOf(suffix) !== i),
      )
    }
  }
  f([], arr)
  return result
}

const errorStub = (fields: Array<string>, pattern: string) => {
  const bodyPatterns = fields.map(field => {
    return {
      matchesJsonPath: `$.[?(@.${field} === '')]`,
    }
  })

  const invalidParams = fields.map(field => {
    return {
      propertyName: field,
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
