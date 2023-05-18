import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'
import { NewPremises, TemporaryAccommodationPremises as Premises } from '../../@types/shared'
import { unique } from '../../utils/utils'
import referenceDataFactory from './referenceData'

class NewPremisesFactory extends Factory<NewPremises> {
  /* istanbul ignore next */
  fromPremises(premises: Premises) {
    return this.params({
      ...premises,
      localAuthorityAreaId: premises.localAuthorityArea.id,
      characteristicIds: premises.characteristics.map(characteristic => characteristic.id),
      probationRegionId: premises.probationRegion.id,
      probationDeliveryUnitId: premises.probationDeliveryUnit.id,
    })
  }
}

export default NewPremisesFactory.define(() => ({
  name: `${faker.word.adjective()} ${faker.word.adverb()} ${faker.word.noun()}`,
  addressLine1: faker.location.streetAddress(),
  addressLine2: faker.location.secondaryAddress(),
  town: faker.location.cityName(),
  postcode: faker.location.zipCode(),
  localAuthorityAreaId: referenceDataFactory.localAuthority().build().id,
  characteristicIds: unique([referenceDataFactory.characteristic('premises').build()]).map(
    characteristic => characteristic.id,
  ),
  probationRegionId: referenceDataFactory.probationRegion().build().id,
  probationDeliveryUnitId: referenceDataFactory.pdu().build().id,
  status: faker.helpers.arrayElement(['active', 'archived'] as const),
  notes: faker.lorem.lines(),
  turnaroundWorkingDayCount: faker.number.int({ min: 1, max: 5 }),
}))
