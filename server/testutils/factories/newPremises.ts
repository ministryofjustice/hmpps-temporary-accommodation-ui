import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'
import { NewPremises } from '@approved-premises/api'

export default Factory.define<NewPremises>(() => ({
  name: `${faker.word.adjective()} ${faker.word.adverb()} ${faker.word.noun()}`,
  addressLine1: faker.address.streetAddress(),
  postcode: faker.address.zipCode(),
  localAuthorityAreaId: faker.datatype.uuid(),
  notes: faker.lorem.lines(),
  service: 'temporary-accommodation',
}))
