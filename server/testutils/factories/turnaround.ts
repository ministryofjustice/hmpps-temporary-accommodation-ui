import { fakerEN_GB as faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import type { Turnaround } from '@approved-premises/api'
import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<Turnaround>(() => ({
  id: faker.string.uuid(),
  bookingId: faker.string.uuid(),
  workingDays: faker.number.int({ min: 1, max: 10 }),
  createdAt: DateFormats.dateObjToIsoDate(faker.date.past()),
}))
