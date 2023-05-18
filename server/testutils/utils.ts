import { faker } from '@faker-js/faker'

export const fakeObject = () => {
  const properties = ['foo', 'bar', 'bike', 'a', 'b', 'name', 'prop']
  const result: Record<string, string | number> = {}

  properties.forEach(prop => {
    result[prop] = faker.datatype.boolean() ? faker.string.sample() : faker.number.int()
  })

  return result
}
