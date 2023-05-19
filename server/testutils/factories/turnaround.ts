import type { Turnaround } from '@approved-premises/api'
import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'
import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<Turnaround>(() => ({
  id: faker.string.uuid(),
  bookingId: faker.string.uuid(),
  workingDays: faker.number.int({ min: 1, max: 10 }),
  createdAt: DateFormats.dateObjToIsoDate(faker.date.past()),
}))
