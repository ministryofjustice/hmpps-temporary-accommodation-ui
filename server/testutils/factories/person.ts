import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { Person } from '@approved-premises/api'
import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<Person>(() => ({
  crn: `C${faker.datatype.number({ min: 100000, max: 999999 })}`,
  name: faker.name.fullName(),
  dateOfBirth: DateFormats.dateObjToIsoDate(faker.date.past()),
  sex: faker.helpers.arrayElement(['Male', 'Female', 'Other', 'Prefer not to say']),
  status: faker.helpers.arrayElement(['InCustody', 'InCommunity']),
  nomsNumber: `NOMS${faker.datatype.number({ min: 100, max: 999 })}`,
  nationality: faker.address.country(),
  religionOrBelief: faker.helpers.arrayElement(['Christian', 'Muslim', 'Jewish', 'Hindu', 'Buddhist', 'Sikh', 'None']),
  prisonName: `HMP ${faker.address.street()}`,
}))
