import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'

import type { Document } from '@approved-premises/api'
import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<Document>(() => ({
  id: faker.string.uuid(),
  level: faker.helpers.arrayElement(['Offender', 'Conviction']),
  fileName: faker.system.commonFileName('pdf'),
  createdAt: DateFormats.dateObjToIsoDate(faker.date.past()),
  typeCode: faker.word.verb(),
  typeDescription: faker.word.noun(),
  description: faker.lorem.sentence(),
}))
