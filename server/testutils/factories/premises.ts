import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { Premises } from 'approved-premises'

export default Factory.define<Premises>(() => ({
  id: faker.datatype.uuid(),
  name: `${faker.word.adjective()} ${faker.word.adverb()} ${faker.word.noun()}`,
  apCode: faker.random.alphaNumeric(5, { casing: 'upper' }),
  postcode: faker.address.zipCode(),
  bedCount: 50,
  apAreaId: faker.random.alphaNumeric(2, { casing: 'upper' }),
}))
