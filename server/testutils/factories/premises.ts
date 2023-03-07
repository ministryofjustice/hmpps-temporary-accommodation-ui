import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'

import type { ApArea, TemporaryAccommodationPremises as Premises } from '@approved-premises/api'
import { unique } from '../../utils/utils'
import referenceDataFactory from './referenceData'

class PremisesFactory extends Factory<Premises> {
  active() {
    return this.params({
      status: 'active',
    })
  }

  archived() {
    return this.params({
      status: 'archived',
    })
  }
}

export default PremisesFactory.define(() => ({
  id: faker.datatype.uuid(),
  name: `${faker.word.adjective()} ${faker.word.adverb()} ${faker.word.noun()}`,
  addressLine1: faker.address.streetAddress(),
  addressLine2: faker.address.secondaryAddress(),
  town: faker.address.cityName(),
  postcode: faker.address.zipCode(),
  bedCount: 50,
  availableBedsForToday: faker.datatype.number({ min: 0, max: 50 }),
  apAreaId: faker.random.alphaNumeric(2, { casing: 'upper' }),
  probationRegion: referenceDataFactory.probationRegion().build(),
  apArea: apAreaFactory.build(),
  localAuthorityArea: referenceDataFactory.localAuthority().build(),
  pdu: referenceDataFactory.pdu().build().id,
  characteristics: unique(
    referenceDataFactory.characteristic('premises').buildList(faker.datatype.number({ min: 1, max: 5 })),
  ),
  status: faker.helpers.arrayElement(['active', 'archived'] as const),
  notes: faker.lorem.lines(5),
}))

const apAreaFactory = Factory.define<ApArea>(() => ({
  id: faker.datatype.uuid(),
  name: faker.address.cityName(),
  identifier: faker.random.alphaNumeric(),
}))
