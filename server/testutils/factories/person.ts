import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { Person } from 'approved-premises'

export default Factory.define<Person>(() => ({
  crn: faker.datatype.uuid(),
  name: faker.name.fullName(),
}))
