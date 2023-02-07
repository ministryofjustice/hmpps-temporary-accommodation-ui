import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'
import type { Extension } from '@approved-premises/api'

import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<Extension>(() => ({
  id: faker.datatype.uuid(),
  previousDepartureDate: DateFormats.dateObjToIsoDate(faker.date.soon()),
  newDepartureDate: DateFormats.dateObjToIsoDate(faker.date.future()),
  bookingId: faker.datatype.uuid(),
  notes: faker.lorem.sentence(),
  createdAt: DateFormats.dateObjToIsoDate(faker.date.past()),
}))
