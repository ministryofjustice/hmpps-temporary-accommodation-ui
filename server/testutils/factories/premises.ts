import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { ApArea, TemporaryAccommodationPremises } from '@approved-premises/api'
import referenceDataFactory from './referenceData'
import { unique } from '../../utils/utils'

export default Factory.define<TemporaryAccommodationPremises>(() => ({
  id: faker.datatype.uuid(),
  name: `${faker.word.adjective()} ${faker.word.adverb()} ${faker.word.noun()}`,
  addressLine1: faker.address.streetAddress(),
  postcode: faker.address.zipCode(),
  bedCount: 50,
  availableBedsForToday: faker.datatype.number({ min: 0, max: 50 }),
  apAreaId: faker.random.alphaNumeric(2, { casing: 'upper' }),
  probationRegion: referenceDataFactory.probationRegion().build(),
  apArea: apAreaFactory.build(),
  localAuthorityArea: referenceDataFactory.localAuthority().build(),
  characteristics: unique(
    referenceDataFactory.characteristic('premises').buildList(faker.datatype.number({ min: 1, max: 5 })),
  ),
  status: faker.helpers.arrayElement(['pending', 'active', 'archived']),
  notes: faker.lorem.lines(5),
}))

const apAreaFactory = Factory.define<ApArea>(() => ({
  id: faker.datatype.uuid(),
  name: faker.address.cityName(),
  identifier: faker.random.alphaNumeric(),
}))
