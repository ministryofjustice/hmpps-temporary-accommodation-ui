import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'

import type { Cas3Extension } from '@approved-premises/api'
import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<Cas3Extension>(() => ({
  bookingId: faker.string.uuid(),
  createdAt: DateFormats.dateObjToIsoDateTime(faker.date.recent()),
  id: faker.string.uuid(),
  newDepartureDate: DateFormats.dateObjToIsoDate(faker.date.future({ years: 1 })),
  notes: faker.lorem.sentence(),
  previousDepartureDate: DateFormats.dateObjToIsoDate(faker.date.soon()),
}))
