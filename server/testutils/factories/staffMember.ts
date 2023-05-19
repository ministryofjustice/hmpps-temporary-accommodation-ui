import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'

import type { StaffMember } from '@approved-premises/api'

export default Factory.define<StaffMember>(() => ({
  name: faker.person.fullName(),
  code: faker.string.uuid(),
  keyWorker: faker.datatype.boolean(),
}))
