import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'
import type { TemporaryAccommodationUser as User } from '@approved-premises/api'
import referenceData from './referenceData'

export default Factory.define<User>(opts => {
  const name = opts.params?.name || faker.person.fullName({})
  const deliusUsername = name.replace(/\s+/g, '.').toLowerCase()
  const pdu = referenceData.pdu().build()
  return {
    id: faker.string.uuid(),
    roles: [],
    region: referenceData.probationRegion().build(),
    probationDeliveryUnit: {
      id: pdu.id,
      name: pdu.name,
    },
    service: 'temporary-accommodation',
    name,
    email: `${deliusUsername}@example.org`,
    telephoneNumber: faker.phone.number(),
    deliusUsername,
  }
})
