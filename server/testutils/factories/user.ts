import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'
import type { ProfileResponse, TemporaryAccommodationUser as User } from '@approved-premises/api'
import referenceData from './referenceData'

const userFactory = Factory.define<User>(({ params }) => {
  const name = params?.name || faker.person.fullName({})
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

export const userProfileFactory = Factory.define<ProfileResponse>(({ params }) => {
  const user = userFactory.build(params?.user)
  const { deliusUsername } = user
  return {
    deliusUsername,
    user,
    loadError: null,
  }
})

export default userFactory
