import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { Person } from 'approved-premises'

export default Factory.define<Person>(() => ({
  crn: `C${faker.datatype.number({ min: 100000, max: 999999 })}`,
  name: faker.name.fullName(),
}))
