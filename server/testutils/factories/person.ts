import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'

import type { Person } from '@approved-premises/api'
import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<Person>(() => ({
  crn: `C${faker.number.int({ min: 100000, max: 999999 })}`,
  name: faker.person.fullName(),
  dateOfBirth: DateFormats.dateObjToIsoDate(faker.date.past()),
  sex: faker.helpers.arrayElement(['Male', 'Female', 'Other', 'Prefer not to say']),
  status: faker.helpers.arrayElement(['InCustody', 'InCommunity']),
  nomsNumber: `NOMS${faker.number.int({ min: 100, max: 999 })}`,
  nationality: faker.location.country(),
  religionOrBelief: faker.helpers.arrayElement(['Christian', 'Muslim', 'Jewish', 'Hindu', 'Buddhist', 'Sikh', 'None']),
  prisonName: `HMP ${faker.location.street()}`,
}))
