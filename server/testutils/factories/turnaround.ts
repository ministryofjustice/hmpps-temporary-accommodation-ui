import type { Turnaround } from '@approved-premises/api'
import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'
import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<Turnaround>(() => ({
  id: faker.datatype.uuid(),
  bookingId: faker.datatype.uuid(),
  workingDays: faker.datatype.number({ min: 1, max: 10 }),
  createdAt: DateFormats.dateObjToIsoDate(faker.date.past()),
}))
