import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'

import type { Arrival } from '@approved-premises/api'
import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<Arrival>(() => {
  const arrivalDate = faker.date.soon()

  return {
    arrivalDate: DateFormats.dateObjToIsoDate(arrivalDate),
    bookingId: faker.string.uuid(),
    expectedDepartureDate: DateFormats.dateObjToIsoDate(faker.date.future({ years: 1, refDate: arrivalDate })),
    notes: faker.lorem.sentence(),
    createdAt: DateFormats.dateObjToIsoDate(faker.date.past()),
  }
})
