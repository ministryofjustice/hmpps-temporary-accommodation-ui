import { fakerEN_GB as faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import { Cas3ValidationResult } from '@approved-premises/api'

export default Factory.define<Cas3ValidationResult>(() => ({
  entityId: faker.string.uuid(),
  entityReference: `${faker.word.adjective()} ${faker.word.adverb()} ${faker.word.noun()}`,
}))
