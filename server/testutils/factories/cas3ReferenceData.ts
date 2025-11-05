import { Factory } from 'fishery'
import { Cas3ReferenceData } from '@approved-premises/api'
import { faker } from '@faker-js/faker'
import { camelCase } from '../../utils/utils'

export default Factory.define<Cas3ReferenceData>(({ params }) => {
  const description = faker.word.words(3)
  return {
    id: faker.string.uuid(),
    description,
    name: camelCase(params.description || description),
  }
})
