import { Factory } from 'fishery'
import { Cas3ReferenceData } from '@approved-premises/api'
import { faker } from '@faker-js/faker'
import lostBedReasonsJson from '../stubs/lost-bed-reasons.json'

export default Factory.define<Cas3ReferenceData>(({ params }) => {
  if (!Object.keys(params).length) return faker.helpers.arrayElement(lostBedReasonsJson)

  return {
    id: faker.string.uuid(),
    name: faker.word.words(3),
  }
})
