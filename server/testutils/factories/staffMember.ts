import { fakerEN_GB as faker } from '@faker-js/faker'
import { Factory } from 'fishery'

import type { StaffMember } from '@approved-premises/api'

export default Factory.define<StaffMember>(() => ({
  name: faker.person.fullName(),
  code: faker.string.uuid(),
  keyWorker: faker.datatype.boolean(),
}))
