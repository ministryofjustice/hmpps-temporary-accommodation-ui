import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'
import type { UpdatePremises } from '@approved-premises/api'
import referenceDataFactory from './referenceData'
import { unique } from '../../utils/utils'

export default Factory.define<UpdatePremises>(() => ({
  addressLine1: faker.address.streetAddress(),
  addressLine2: faker.address.secondaryAddress(),
  town: faker.address.city(),
  postcode: faker.address.zipCode(),
  localAuthorityAreaId: referenceDataFactory.localAuthority().build().id,
  characteristicIds: unique([referenceDataFactory.characteristic('premises').build()]).map(
    characteristic => characteristic.id,
  ),
  probationRegionId: referenceDataFactory.probationRegion().build().id,
  pdu: referenceDataFactory.pdu().build().id,
  status: faker.helpers.arrayElement(['pending', 'active', 'archived']),
  notes: faker.lorem.lines(),
}))
