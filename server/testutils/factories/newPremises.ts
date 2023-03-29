import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'
import { NewPremises } from '../../@types/shared'
import { unique } from '../../utils/utils'
import referenceDataFactory from './referenceData'

export default Factory.define<NewPremises>(() => ({
  name: `${faker.word.adjective()} ${faker.word.adverb()} ${faker.word.noun()}`,
  addressLine1: faker.address.streetAddress(),
  addressLine2: faker.address.secondaryAddress(),
  town: faker.address.cityName(),
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
