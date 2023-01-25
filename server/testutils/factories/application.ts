import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { ApprovedPremisesApplication as Application } from '@approved-premises/api'

import personFactory from './person'
import { DateFormats } from '../../utils/dateUtils'
import risks from './risks'

export default Factory.define<Application>(() => ({
  id: faker.datatype.uuid(),
  person: personFactory.build(),
  createdByUserId: faker.datatype.uuid(),
  schemaVersion: faker.datatype.uuid(),
  createdAt: DateFormats.formatApiDate(faker.date.past()),
  submittedAt: DateFormats.formatApiDate(faker.date.past()),
  data: JSON.parse(faker.datatype.json()),
  document: JSON.parse(faker.datatype.json()),
  outdatedSchema: faker.datatype.boolean(),
  isWomensApplication: faker.datatype.boolean(),
  isPipeApplication: faker.datatype.boolean(),
  risks: risks.build(),
}))
