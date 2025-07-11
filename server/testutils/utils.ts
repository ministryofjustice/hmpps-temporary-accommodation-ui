import { fakerEN_GB as faker } from '@faker-js/faker'
import { Factory } from 'fishery'

export const fakeObject = () => {
  const properties = ['foo', 'bar', 'bike', 'a', 'b', 'name', 'prop']
  const result: Record<string, string | number> = {}

  properties.forEach(prop => {
    result[prop] = faker.datatype.boolean() ? faker.string.sample() : faker.number.int()
  })

  return result
}

export const buildUniqueList = <T, U>(factory: Factory<T>, uniqueBy: (t: T) => U, count: number): Array<T> => {
  const results: Array<T> = []
  const seen: Set<U> = new Set()

  while (results.length < count) {
    const result = factory.build()
    const identifier = uniqueBy(result)
    if (!seen.has(identifier)) {
      seen.add(identifier)
      results.push(result)
    }
  }

  return results
}
