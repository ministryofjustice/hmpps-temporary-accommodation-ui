import { Factory } from 'fishery'
import { fakerEN_GB as faker } from '@faker-js/faker'
import { Cas3NewPremises, Cas3Premises } from '@approved-premises/api'

class Cas3NewPremisesFactory extends Factory<Cas3NewPremises> {
  fromPremises(premises: Cas3Premises) {
    return this.params({
      ...premises,
      localAuthorityAreaId: premises.localAuthorityArea.id,
      characteristicIds: premises.characteristics.map(characteristic => characteristic.id),
      probationRegionId: premises.probationRegion.id,
      probationDeliveryUnitId: premises.probationDeliveryUnit.id,
    })
  }
}

export default Cas3NewPremisesFactory.define(() => ({
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
