import { fakerEN_GB as faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import { Cas3BedspaceReference } from '@approved-premises/api'

export default Factory.define<Cas3BedspaceReference>(() => ({
  id: faker.string.uuid(),
  reference: `${faker.word.adjective()} ${faker.word.adverb()} ${faker.word.noun()}`,
}))
