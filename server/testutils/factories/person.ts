import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'

import type { Person } from '@approved-premises/api'
import { DateFormats } from '../../utils/dateUtils'

export const fullPersonFactory = Factory.define<Person>(() => ({
  crn: `C${faker.number.int({ min: 100000, max: 999999 })}`,
  name: faker.person.fullName(),
  dateOfBirth: DateFormats.dateObjToIsoDate(faker.date.past()),
  sex: faker.helpers.arrayElement(['Male', 'Female', 'Other', 'Prefer not to say']),
  status: faker.helpers.arrayElement(['InCustody', 'InCommunity']),
  nomsNumber: `NOMS${faker.number.int({ min: 100, max: 999 })}`,
  nationality: faker.location.country(),
  religionOrBelief: faker.helpers.arrayElement(['Christian', 'Muslim', 'Jewish', 'Hindu', 'Buddhist', 'Sikh', 'None']),
  ethnicity: faker.helpers.arrayElement([
    'Indian',
    'Pakistani',
    'Bangladeshi',
    'Chinese',
    'Any other Asian background',
    'Caribbean',
    'African',
    'Any other Black, Black British, or Caribbean background',
    'White and Black Caribbean',
    'White and Black African',
    'White and Asian',
    'Any other Mixed or multiple ethnic background',
    'English, Welsh, Scottish, Northern Irish or British',
    'Irish',
    'Gypsy or Irish Traveller',
    'Roma',
    'Any other White background',
    'Arab',
    'Any other ethnic group',
  ]),
  prisonName: `HMP ${faker.location.street()}`,
}))

export const restrictedPersonFactory = Factory.define<Person>(
  () =>
    ({
      name: '',
      crn: `C${faker.number.int({ min: 100000, max: 999999 })}`,
    }) as Person,
)
