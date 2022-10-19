import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { ApArea, Premises, ProbationRegion, LocalAuthorityArea } from '@approved-premises/api'

export default Factory.define<Premises>(() => ({
  id: faker.datatype.uuid(),
  name: `${faker.word.adjective()} ${faker.word.adverb()} ${faker.word.noun()}`,
  apCode: faker.random.alphaNumeric(5, { casing: 'upper' }),
  postcode: faker.address.zipCode(),
  bedCount: 50,
  availableBedsForToday: faker.datatype.number({ min: 0, max: 50 }),
  apAreaId: faker.random.alphaNumeric(2, { casing: 'upper' }),
  probationRegion: probationRegionFactory.build(),
  apArea: apAreaFactory.build(),
  localAuthorityArea: localAuthorityAreaFactory.build(),
}))

const probationRegionFactory = Factory.define<ProbationRegion>(() => ({
  id: faker.datatype.uuid(),
  name: faker.address.cityName(),
}))

const apAreaFactory = Factory.define<ApArea>(() => ({
  id: faker.datatype.uuid(),
  name: faker.address.cityName(),
  identifier: faker.random.alphaNumeric(),
}))

const localAuthorityAreaFactory = Factory.define<LocalAuthorityArea>(() => ({
  id: faker.datatype.uuid(),
  name: faker.address.county(),
  identifier: faker.random.alphaNumeric(),
}))
