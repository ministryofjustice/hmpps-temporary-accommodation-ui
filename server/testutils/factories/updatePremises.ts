import type { UpdatePremises } from '@approved-premises/api'
import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'
import { unique } from '../../utils/utils'
import referenceDataFactory from './referenceData'

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
  status: faker.helpers.arrayElement(['active', 'archived']),
  notes: faker.lorem.lines(),
}))
