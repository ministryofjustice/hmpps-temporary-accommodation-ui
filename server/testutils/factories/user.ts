import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'
import type { TemporaryAccommodationUser as User } from '@approved-premises/api'
import referenceData from './referenceData'

export default Factory.define<User>(() => {
  const name = faker.person.fullName({}).toUpperCase()
  return {
    id: faker.string.uuid(),
    roles: [],
    region: referenceData.probationRegion().build(),
    service: 'temporary-accommodation',
    name,
    deliusUsername: name.replace(/\s+/g, '.'),
  }
})
