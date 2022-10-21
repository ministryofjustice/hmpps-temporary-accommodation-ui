import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { ApArea, ProbationRegion, LocalAuthorityArea } from '@approved-premises/api'
import { Premises } from '@approved-premises/ui'

export default Factory.define<Premises>(() => ({
  id: faker.datatype.uuid(),
  name: `${faker.word.adjective()} ${faker.word.adverb()} ${faker.word.noun()}`,
  apCode: faker.random.alphaNumeric(5, { casing: 'upper' }),
  address: faker.address.streetAddress(),
  postcode: faker.address.zipCode(),
  bedCount: 50,
  availableBedsForToday: faker.datatype.number({ min: 0, max: 50 }),
  apAreaId: faker.random.alphaNumeric(2, { casing: 'upper' }),
  probationRegion: probationRegionFactory.build(),
  apArea: apAreaFactory.build(),
  localAuthorityArea: localAuthorityAreaFactory.build(),
  addressLine1: faker.address.streetAddress(),
  notes: faker.lorem.lines(5),
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
