import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'
import type { NewExtension } from '@approved-premises/api'

import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<NewExtension>(() => ({
  newDepartureDate: DateFormats.dateObjToIsoDate(faker.date.future()),
  notes: faker.lorem.sentence(),
}))
