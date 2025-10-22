import { Cas3UpdatePremises } from '@approved-premises/api'
import { Factory } from 'fishery'
import { fakerEN_GB as faker } from '@faker-js/faker'

export default Factory.define<Cas3UpdatePremises>(() => ({
  reference: `${faker.word.adjective()} ${faker.word.adverb()} ${faker.word.noun()}`,
  addressLine1: faker.location.streetAddress(),
  addressLine2: faker.location.secondaryAddress(),
  town: faker.location.city(),
  postcode: faker.location.zipCode(),
  localAuthorityAreaId: faker.string.uuid(),
  probationRegionId: faker.string.uuid(),
  probationDeliveryUnitId: faker.string.uuid(),
  turnaroundWorkingDays: faker.number.int({ min: 1, max: 14 }),
  characteristicIds: faker.helpers.multiple(() => faker.string.uuid(), { count: { min: 1, max: 5 } }),
  notes: faker.lorem.sentences(5),
}))
