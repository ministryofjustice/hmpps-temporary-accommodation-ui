import type { TemporaryAccommodationPremises as Premises, UpdatePremises } from '@approved-premises/api'
import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'
import { unique } from '../../utils/utils'
import referenceDataFactory from './referenceData'

class UpdatePremisesFactory extends Factory<UpdatePremises> {
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

export default UpdatePremisesFactory.define(() => ({
  addressLine1: faker.address.streetAddress(),
  addressLine2: faker.address.secondaryAddress(),
  town: faker.address.city(),
  postcode: faker.address.zipCode(),
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
