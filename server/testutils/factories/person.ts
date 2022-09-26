import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { Person } from 'approved-premises'
import { DateFormats } from '../../utils/dateFormats'

export default Factory.define<Person>(() => ({
  crn: `C${faker.datatype.number({ min: 100000, max: 999999 })}`,
  name: faker.name.fullName(),
  dateOfBirth: DateFormats.formatApiDate(faker.date.past()),
  sex: faker.helpers.arrayElement(['Male', 'Female', 'Other', 'Prefer not to say']),
  nationality: faker.address.country(),
  religion: faker.random.word(),
}))
