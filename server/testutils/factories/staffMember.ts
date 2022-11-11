import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { StaffMember } from '@approved-premises/api'

export default Factory.define<StaffMember>(() => ({
  name: faker.name.fullName(),
  code: faker.datatype.uuid(),
  keyWorker: faker.datatype.boolean(),
}))
