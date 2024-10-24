import { Factory } from 'fishery'
import { fakerEN_GB as faker } from '@faker-js/faker'
import type { NewExtension } from '@approved-premises/api'

import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<NewExtension>(() => ({
  newDepartureDate: DateFormats.dateObjToIsoDate(faker.date.future()),
  notes: faker.lorem.sentence(),
}))
