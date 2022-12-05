import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'
import { NewPremises } from '@approved-premises/api'
import referenceDataFactory from './referenceData'
import { unique } from '../../utils/utils'

export default Factory.define<NewPremises>(() => ({
  name: `${faker.word.adjective()} ${faker.word.adverb()} ${faker.word.noun()}`,
  addressLine1: faker.address.streetAddress(),
  postcode: faker.address.zipCode(),
  localAuthorityAreaId: referenceDataFactory.localAuthority().build().id,
  characteristicIds: unique([referenceDataFactory.characteristic('premises').build()]).map(
    characteristic => characteristic.id,
  ),
  probationRegionId: faker.datatype.uuid(),
  status: faker.helpers.arrayElement(['pending', 'active', 'archived']),
  notes: faker.lorem.lines(),
}))
