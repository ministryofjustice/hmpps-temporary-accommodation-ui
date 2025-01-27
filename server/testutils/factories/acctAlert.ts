import { Factory } from 'fishery'
import { fakerEN_GB as faker } from '@faker-js/faker'
import type { PersonAcctAlert } from '@approved-premises/api'

import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<PersonAcctAlert>(() => ({
  alertId: faker.number.int(),
  dateCreated: DateFormats.dateObjToIsoDate(faker.date.past()),
  dateExpires: DateFormats.dateObjToIsoDate(faker.date.future()),
  comment: faker.lorem.sentence(),
}))
